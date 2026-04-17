import { NextApiRequest, NextApiResponse } from "next";
import { getValidTikTokTokens } from "@/lib/tiktok-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tokens = await getValidTikTokTokens(req, res);
  if (!tokens?.access_token) {
    return res.status(401).json({ error: "TikTok account not connected" });
  }

  try {
    const response = await  fetch("https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_link,create_time", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_count: 20
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching TikTok user videos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}