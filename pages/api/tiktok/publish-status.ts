import { getValidTikTokTokens } from "@/lib/tiktok-auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const publishId = req.body.publishId;
  const tokens = await getValidTikTokTokens(req, res);
  if (!tokens?.access_token) {
    return res.status(401).json({ error: "TikTok account not connected" });
  }

  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publish_id: publishId,
        }),
      },
    );

    if (!response.ok) {
      console.log("Failed to fetch publish status:", response.status, await response.text());
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching publish status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
