import { oauth } from "@/pages/api/connect-yt";
import { Request, Response } from "express";
const Youtube = require("youtube-api");

export default async function handler(req: Request, res: Response) {
  const queryString = req.url.split("?")[1];
  const code = new URLSearchParams(queryString).get("code") || "";

  // Get the tokens
  oauth.getToken(code, async (err: any, tokens: string) => {
    if (err) {
      console.log("err");
      return;
    }

    // Set the credentials
    oauth.setCredentials(tokens);

    // Set the tokens in a cookie
    res.setHeader(
      "Set-Cookie",
      `tokens=${encodeURIComponent(JSON.stringify(tokens))}; Path=/`
    );

    // Get the user's playlists
    const userPlaylists = await Youtube.playlists.list({
      part: ["contentDetails"],
      mine: true,
    }).then((response: { data: { items: any[] } }) => response.data.items);

    const playlistId = userPlaylists[0].id;
    console.log('-------playlistId', playlistId);
    
    // Set the playlistId in a cookie
    res.setHeader('Set-Cookie', `userPlaylistId=${playlistId}; Path=/`);

    // Hack to close the window
    res.send("<script>window.close();</script>");
  });
}
