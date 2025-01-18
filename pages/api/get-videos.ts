const Youtube = require("youtube-api");
import { Request, Response } from "express";

export default async function handler(req:Request, res:Response) {
  const { playlistId } = req.body;

  Youtube.playlistItems
    .list({
      part: ["status, id, contentDetails"],
      playlistId: playlistId,
    })
    .then(
      (response:{data:{items:any[]}}) => {
        const playlistItems = response.data.items;
        const videoIds = playlistItems.map(
          (pItem) => pItem.contentDetails.videoId
        );
        Youtube.videos
          .list({
            part: ["status", "snippet"],
            id: videoIds,
          })
          .then(
            (response:{data:{items:any[]}}) => {
              const videos = response.data.items;
              // Get scheduled and published videos
              const scheduledVideos = videos.filter((video) => {
                return (
                  new Date(video.status.publishAt) >= new Date() ||
                  new Date(video.snippet.publishedAt) <= new Date()
                );
              });
              res.send(scheduledVideos);
            },
            (err:string) => {
              console.error("Execute error", err);
            }
          );
      },
      (err:string) => {
        console.error("Execute error", err);
      }
    );
}
