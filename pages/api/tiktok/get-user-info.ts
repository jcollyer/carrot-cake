import { NextApiRequest, NextApiResponse } from "next";
import { getTokensCookie } from "@/app/utils/getTokensCookie";
import { GET_TT_USER_INFO_URL } from "@/app/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cookie } = req.headers;

  const accessToken = getTokensCookie(cookie, "tiktok-tokens").access_token;

  try {
    const response = await fetch(
      GET_TT_USER_INFO_URL,
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
