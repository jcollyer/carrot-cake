import { NextApiRequest, NextApiResponse } from "next";
import { oauth } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils/getTokensCookie";
import { parseDateOnly } from "@/app/utils/dateOnly";
import { YouTubeVideo } from "@/types";
const Youtube = require("youtube-api");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, headers } = req;
  const { id, title, description, categoryId, scheduleDate, tags } = body;
  const { cookie } = headers;

  const jsonTokens = getTokensCookie(cookie, "youtube-tokens");
  const publishAt = scheduleDate ? parseDateOnly(scheduleDate).toISOString() : undefined;

  oauth.setCredentials(jsonTokens);
  const inThePast = publishAt ? new Date(publishAt) < new Date() : true;

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
            publishAt,
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
