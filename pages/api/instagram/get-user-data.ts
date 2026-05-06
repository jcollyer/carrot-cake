import { NextApiRequest, NextApiResponse } from "next";
import { GET_IG_USER_INFO_URL } from "@/app/constants";
import { getValidInstagramTokens } from "@/lib/instagram-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tokens = await getValidInstagramTokens(req, res);
  if (!tokens?.access_token || !tokens?.user_id) {
    return res.status(401).json({ error: "Instagram not connected" });
  }

  const { access_token: accessToken, user_id: userId } = tokens;

  const profileUrl = `https://graph.instagram.com/${userId}${GET_IG_USER_INFO_URL}${accessToken}`;
  try {
    const response = await fetch(profileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
