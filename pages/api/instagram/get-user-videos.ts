import { NextApiRequest, NextApiResponse } from "next";
import { GET_IG_USER_MEDIA_URL } from "@/app/constants";
import { getTokensCookie } from "@/app/utils/getTokensCookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cookie } = req.headers;
  const jsonTokens = getTokensCookie(cookie, "ig-access-token");

  const mediaUrl = `${GET_IG_USER_MEDIA_URL}${jsonTokens.access_token}`;
  try {
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jsonTokens.access_token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error(
        "Failed to fetch Instagram user media:",
        response.statusText
      );
    }
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Instagram user media:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}