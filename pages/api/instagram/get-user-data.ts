import { NextApiRequest, NextApiResponse } from "next";
import { GET_IG_USER_INFO_URL } from "@/app/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const searchParams = new URL(`${process.env.BASE_URL}${req.url}`).searchParams;
  const accessTokens = searchParams.get("accessTokens");
  const {access_token, user_id} = JSON.parse(accessTokens || "");

  const profileUrl = `https://graph.instagram.com/${user_id}${GET_IG_USER_INFO_URL}${access_token}`;
  try {
    const response = await fetch(profileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
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
