import { NextApiRequest, NextApiResponse } from "next";
const querystring = require("querystring");

const isDev = process.env.NODE_ENV === "development";

const ENDPOINT_REDIRECT = isDev
  ? process.env.REDIRECT_URIS_TIKTOK_LOCAL
  : process.env.REDIRECT_URIS_TIKTOK_PROD;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { code } = req.query;
    const decode = decodeURI(code as string);
    const tokenEndpoint = "https://open.tiktokapis.com/v2/oauth/token/";
    const params = {
      client_key: process.env.TIKTOK_CLIENT_KEY_SANDBOX,
      client_secret: process.env.TIKTOK_CLIENT_SECRET_SANDBOX,
      code: decode,
      grant_type: "authorization_code",
      redirect_uri: ENDPOINT_REDIRECT,
    };

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: querystring.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from TikTok:", errorText);
      return res
        .status(response.status)
        .send("Failed to retrieve access token.");
    }
    const tokens = await response.json();

    // Set the tokens in a cookie
    res.setHeader(
      "Set-Cookie",
      `tiktok-tokens=${encodeURIComponent(
        JSON.stringify(tokens)
      )}; Path=/; Max-Age=86400`
    );

    // Hack to close the window
    res.send(
      "<script>window.parent.location.reload(); window.close();</script>"
    );
  } catch (error: any) {
    console.error("Error during callback:", error?.error_description || error);
    res.status(500).send("An error occurred during the login process.");
  }
}
