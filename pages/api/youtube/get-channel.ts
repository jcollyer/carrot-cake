import { NextApiRequest, NextApiResponse } from "next";
import { oauth } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils/getTokensCookie";
const Youtube = require("youtube-api");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cookie } = req.headers;
  const jsonTokens = getTokensCookie(cookie, "youtube-tokens");

  oauth.setCredentials(jsonTokens);

  const userInfo = await Youtube.channels
    .list({
      part: ["snippet,contentDetails,statistics"],
      mine: true,
    })
    .then(
      (response: {
        data: {
          items: [{ info: {} }];
        };
      }) => {
        const items = response.data.items;
        return items;
      }
    );

  const data = userInfo[0];
  res.status(200).json({ data });
}
