import { NextApiRequest, NextApiResponse } from "next";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/app/utils/s3-client";

const isDev = process.env.NODE_ENV === "development";
const BASE_URL = isDev
  ? process.env.BASE_URL_LOCAL
  : process.env.BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URL(`${BASE_URL}${req.url}`).searchParams;
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");

  if (!fileName || !contentType) {
    return res.status(500).json(null);
  }

  const fileKey = `${Date.now().toString()}-${fileName}`; // for uniqueness of the url

  const uploadParams = {
    Bucket: process.env.AWS_S3_IG_BUCKET_NAME!,
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
