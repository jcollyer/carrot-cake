import { NextApiRequest, NextApiResponse } from "next";
import { getTokensCookie } from "@/app/utils/getTokensCookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cookie } = req.headers;
  const { draft } = req.body;

  const accessToken = getTokensCookie(cookie, "tiktok-tokens").access_token;
  const url = draft
    ? "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/"
    : "https://open.tiktokapis.com/v2/post/publish/video/init/";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...req.body }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error uploading TikTok video:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
