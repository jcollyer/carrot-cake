import { NextApiRequest, NextApiResponse } from "next";
import { GET_IG_USER_INFO_URL } from "@/app/constants";
import { getTokensCookie } from "@/app/utils/getTokensCookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cookie } = req.headers;
  const jsonTokens = getTokensCookie(cookie, "ig-access-token");
  const userId = jsonTokens.user_id;

  const profileUrl = `https://graph.instagram.com/${userId}${GET_IG_USER_INFO_URL}${jsonTokens.access_token}`;
  try {
    const response = await fetch(profileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jsonTokens.access_token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error(
        "Failed to fetch Instagram user data:",
        response.statusText
      );
    }
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Instagram user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
