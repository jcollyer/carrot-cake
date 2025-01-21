const Youtube = require("youtube-api");
import { oauth } from "./connect-yt";
import { Request, Response } from "express";
import { getTokensCookie } from "@/app/utils";

export default async function handler(req: Request, res: Response) {
  const { body, headers } = req;
  const { cookie } = headers;
  const { playlistId } = body;

  const jsonTokens = getTokensCookie(cookie);

  oauth.setCredentials(jsonTokens);

  const playlistItems = await Youtube.playlistItems
    .list({
      part: ["status, id, contentDetails"],
      playlistId,
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

  // Get only the videos that are scheduled to be published
  const scheduledVideos = videos.filter((video: any) => {
    return (
      new Date(video.status.publishAt) >= new Date() ||
      new Date(video.snippet.publishedAt) <= new Date()
    );
  });

  res.send(scheduledVideos);
}
