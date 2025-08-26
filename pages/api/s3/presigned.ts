import { NextApiRequest, NextApiResponse } from "next";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/app/utils/s3-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URL(`${process.env.BASE_URL}${req.url}`)
    .searchParams;
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");
  const s3Bucket = searchParams.get("s3Bucket");

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
