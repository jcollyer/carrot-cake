import { NextApiRequest, NextApiResponse } from "next";
import { oauth } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils";
const Youtube = require("youtube-api");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cookie } = req.headers;
  const jsonTokens = getTokensCookie(cookie);

  oauth.setCredentials(jsonTokens);

  const userPlaylists = await Youtube.channels
    .list({
      part: ["contentDetails"],
      mine: true,
    })
    .then(
      (response: {
        data: {
          items: [
            { contentDetails: { relatedPlaylists: { uploads: string } } }
          ];
        };
      }) => response.data.items
    );

  // Get the YT Shorts playlistId
  const playlistId = userPlaylists[0].contentDetails?.relatedPlaylists?.uploads;

  // Set the playlistId in a cookie
  res.setHeader("Set-Cookie",
    `userPlaylistId=${encodeURIComponent(JSON.stringify(playlistId))}; Path=/; Max-Age=31536000`);
  res.status(200).json({ playlistId });
}
