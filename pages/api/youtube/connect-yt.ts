import { NextApiRequest, NextApiResponse } from "next";
const Youtube = require("youtube-api");
 
const isDev = process.env.NODE_ENV === "development";
export const scope =
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube";

export const oauth = Youtube.authenticate({
  type: "oauth",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_url: isDev
    ? process.env.REDIRECT_URIS_LOCAL
    : process.env.REDIRECT_URIS_PROD,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oAuthUrl = oauth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope,
  });

  res.status(200).json({url: oAuthUrl});
}