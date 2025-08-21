import { NextApiRequest, NextApiResponse } from "next";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/app/utils/s3-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(500).json(null);
  }
  const params = {
    Bucket: process.env.AWS_S3_IG_BUCKET_NAME,
    Key: String(fileName).split("/").pop(),
  };

  try {
    const command = new DeleteObjectCommand(params);
    const response = await s3Client.send(command);
    console.log("Object deleted successfully:", response);
  } catch (err) {
    throw new Error(`Error deleting object: ${err}`);
  }

  return res.status(200).json({ message: "File deleted successfully" });
}
