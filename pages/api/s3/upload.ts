import { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";

export default async function POST(request: NextApiRequest, response: NextApiResponse) {
  const { objectName, objectUrl } = await request.body();

  if (!process.env.DATABASE_URL)
    return response.status(500).json(null);

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Create the user table if it does not exist
    await sql('CREATE TABLE IF NOT EXISTS "s3" (name TEXT, img_url TEXT)');

    // Store the file URL in the database
    await sql("INSERT INTO s3 (name, img_url) VALUES ($1, $2)", [
      objectName,
      objectUrl,
    ]);

    return response.status(200).json(
      { message: "Successfully uploaded the file" }
    );
  } catch (error) {
    console.error("Error uploading file: ", error);
    return response.status(500).json(
      { error: "Failed to upload file" }
    );
  }
}
