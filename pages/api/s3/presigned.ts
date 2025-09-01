import { NextApiRequest, NextApiResponse } from "next";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URL(`${process.env.BASE_URL}${req.url}`)
    .searchParams;
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");
  const s3Bucket = searchParams.get("s3Bucket");
  const region = searchParams.get("region");

  const s3Client = await new S3Client({
    region: region || process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
  });

  if (!fileName || !contentType) {
    return res.status(500).json(null);
  }

  const fileKey = `${Date.now().toString()}-${fileName}`; // for uniqueness of the url

  const uploadParams = {
    Bucket: process.env[s3Bucket || ""] || "",
    Key: fileKey,
    ContentType: "image/png",
  };
  let command;
  try {
    command = new PutObjectCommand(uploadParams);
  } catch (err) {
    throw new Error(`Error creating signed URL: ${err}`);
  }
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  if (signedUrl) {
    return res.status(200).json({ signedUrl });
  }
  return res.status(500).json(null);
}
