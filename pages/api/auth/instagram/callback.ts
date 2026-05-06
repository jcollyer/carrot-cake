import { NextApiRequest, NextApiResponse } from "next";
import {
  setInstagramCookie,
  upsertInstagramAccountTokens,
} from "@/lib/instagram-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

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
    if(!response.ok) {
      throw new Error("Failed to exchange code for access token:", data);
    }
    const accessToken = data.access_token;
    const userId = data.user_id;
    try {
      const exchangeResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.IG_CLIENT_SECRET}&access_token=${accessToken}`
      );
      const exchangeData = await exchangeResponse.json();
      if(!exchangeResponse.ok) {
        throw new Error("Failed to exchange for long-lived access token:", exchangeData);
      }
      const longLivedAccessToken = exchangeData.access_token;
      const ttl = exchangeData.expires_in;

      // Persist to the Account table so we can silently re-issue the cookie
      // on subsequent visits (and refresh the token from cron before expiry).
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.id) {
        await upsertInstagramAccountTokens(
          session.user.id,
          {
            access_token: longLivedAccessToken,
            refresh_token: longLivedAccessToken,
            expires_in: ttl,
            user_id: String(userId),
          },
          String(userId),
        );
      }

      // Set the long-lived access token cookie via the auth lib (also writes
      // refresh_token + expires_in into the cookie payload for parity with
      // TikTok).
      setInstagramCookie(res, {
        access_token: longLivedAccessToken,
        refresh_token: longLivedAccessToken,
        expires_in: ttl,
        user_id: String(userId),
      });

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
