import { NextApiRequest, NextApiResponse } from "next";
import { oauth } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils";
import { YouTubeVideo } from "@/types/video";
const Youtube = require("youtube-api");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, headers } = req;
  const { id, title, description, categoryId, scheduleDate, tags } = body;
  const { cookie } = headers;

  const jsonTokens = getTokensCookie(cookie);

  oauth.setCredentials(jsonTokens);
  const inThePast = new Date(scheduleDate) < new Date();

  return Youtube.videos
    .update({
      part: "id,snippet,status",
      requestBody: {
        id,
        snippet: {
          title,
          description,
          categoryId,
          tags,
        },
        // add status object only if scheduleDate is in the future
        ...(!inThePast && {
          status: {
            privacyStatus: "private",
            publishAt: scheduleDate,
          },
        }),
      },
    })
    .then(
      (response: { data: YouTubeVideo }) => {
        res.send(response.data);
      },
      (err: string) => {
        console.error("Execute error", err);
      }
    );
}
