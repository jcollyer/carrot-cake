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
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Handle the user info data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching TikTok user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
