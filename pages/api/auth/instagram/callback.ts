import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;
  if (!code || Array.isArray(code)) {
    res.status(400).json({ error: "Invalid or missing code parameter" });
    return;
  }

  try {
    const response = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.IG_CLIENT_ID || "",
          client_secret: process.env.IG_CLIENT_SECRET || "",
          grant_type: "authorization_code",
          redirect_uri: process.env.IG_REDIRECT_URI || "",
          code: code as string,
        }),
      }
    );

    // get the access token from the response to exchange for a long-lived token
    const data = await response.json();
    const accessToken = data.access_token;
    const userId = data.user_id;
    try {
      const exchangeResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.IG_CLIENT_SECRET}&access_token=${accessToken}`
      );
      const exchangeData = await exchangeResponse.json();
      const longLivedAccessToken = exchangeData.access_token;
      const ttl = exchangeData.expires_in;

      // Set the long-lived access token in a cookie
      res.setHeader(
        "Set-Cookie",
        `ig-access-token={"access_token": "${longLivedAccessToken}", "user_id": "${userId}"}; Path=/; Max-Age=${ttl};`
      );

      // Hack to close the window
      res.send(
        "<script>window.parent.location.reload(); window.close();</script>"
      );
    } catch (exchangeError) {
      console.error("Error exchanging access token:", exchangeError);
      res.status(500).json({ error: "Failed to exchange access token" });
      return;
    }
  } catch (error) {
    console.error("Error exchanging Instagram code for access token:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}
