import { getTokensCookie } from "@/app/utils/getTokensCookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const publishId = req.body.publishId;
  const { cookie } = req.headers;

  const accessToken = getTokensCookie(cookie, "tiktok-tokens").access_token;

  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
