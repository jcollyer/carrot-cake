import { NextApiRequest, NextApiResponse } from "next";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/app/utils/s3-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URL(`${process.env.BASE_URL}${req.url}`).searchParams;
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");
  const platform = searchParams.get("platform");

  if (!fileName || !contentType) {
    return res.status(500).json(null);
  }

  const fileKey = `${Date.now().toString()}-${fileName}`; // for uniqueness of the url

  const uploadParams = {
    Bucket: platform === "ig" ? process.env.AWS_S3_IG_BUCKET_NAME! : process.env.AWS_S3_TT_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  };
  const command = new PutObjectCommand(uploadParams);
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  if (signedUrl){
    return res.status(200).json({ signedUrl });
  }
  return res.status(500).json(null);
}
