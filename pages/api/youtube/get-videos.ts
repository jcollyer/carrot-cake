import { NextApiRequest, NextApiResponse } from "next";
import { oauth } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils";
const Youtube = require("youtube-api");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { body, headers } = req;
  const { cookie } = headers;
  const { playlistId } = body;

  const jsonTokens = getTokensCookie(cookie, "tokens");

  await oauth.setCredentials(jsonTokens);

  const playlistItems = await Youtube.playlistItems
    .list({
      part: ["status, id, contentDetails"],
      playlistId,
      maxResults: 50,
    })
    .then((response: { data: { items: any[] } }) => response.data.items);

  const videoIds = playlistItems.map(
    (item: { contentDetails: { videoId: string } }) =>
      item.contentDetails.videoId
  );

  const videos = await Youtube.videos
    .list({
      part: ["status", "snippet"],
      id: videoIds,
    })
    .then((response: { data: { items: any[] } }) => response.data.items);

  // // Get only the videos that are scheduled to be published
  // const scheduledVideos = videos.filter((video: any) => {
  //   return (
  //     new Date(video.status.publishAt) >= new Date() ||
  //     new Date(video.snippet.publishedAt) <= new Date()
  //   );
  // });

  res.send(videos);
}
