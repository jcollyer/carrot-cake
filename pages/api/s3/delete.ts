import { NextApiRequest, NextApiResponse } from "next";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(500).json(null);
  }
  const searchParams = new URL(`${process.env.BASE_URL}${req.url}`)
    .searchParams;
  const region = searchParams.get("region");
  const s3Bucket = searchParams.get("s3Bucket");
  console.log(
    "Attempting to delete file:-------",
    String(fileName).split("/").pop(),
    process.env.AWS_S3_IG_BUCKET_NAME
  );
  const params = {
    Bucket: process.env[s3Bucket || ""] || "",
    Key: String(fileName).split("/").pop(),
  };

  const s3Client = await new S3Client({
    region: region || process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const command = new DeleteObjectCommand(params);
    const response = await s3Client.send(command);
    console.log("Object deleted successfully:", response);
  } catch (err) {
    throw new Error(`Error deleting object: ${err}`);
  }

  return res.status(200).json({ message: "File deleted successfully" });
}
