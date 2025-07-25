import { NextApiRequest, NextApiResponse } from "next";
const Youtube = require("youtube-api");
 
const isDev = process.env.NODE_ENV === "development";
export const scope =
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube";

export const oauth = Youtube.authenticate({
  type: "oauth",
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_url: isDev
    ? process.env.YOUTUBE_REDIRECT_URIS_LOCAL
    : process.env.YOUTUBE_REDIRECT_URIS_PROD,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!!req.body.refreshToken){
    const refreshToken = req.body.refreshToken;
    await oauth.setCredentials({refresh_token: refreshToken});
    const tokens = await oauth.refreshAccessToken();
    res.status(200).json(tokens);
    return;
  }
  const oAuthUrl = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope,
  });

  res.status(200).json({url: oAuthUrl});
}