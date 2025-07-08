import { NextApiRequest, NextApiResponse } from "next";
import { getTokensCookie } from "@/app/utils/getTokensCookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cookie } = req.headers;

  const accessToken = getTokensCookie(cookie, "tiktok-tokens").access_token;

  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,is_verified,follower_count,following_count,likes_count,video_count",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
    }
    const data = await response.json();
    // Handle the user info data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching TikTok user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
