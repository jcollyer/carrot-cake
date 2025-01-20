const Youtube = require("youtube-api");
import { Request, Response } from "express";

export default async function handler(req:Request, res:Response) {
  const { playlistId } = req.body;

  return Youtube.playlistItems
    .list({
      part: ["status, id, contentDetails"],
      playlistId,
    })
    .then(
      (response:{data:{items:any[]}}) => {
        console.log('-----------get playlists======', response.data.items);
        const playlistItems = response.data.items;
        const videoIds = playlistItems.map(
          (pItem) => pItem.contentDetails.videoId
        );
        return Youtube.videos
          .list({
            part: ["status", "snippet"],
            id: videoIds,
          })
          .then(
            (response:{data:{items:any[]}}) => {
              console.log('-----------get videos======', response.data.items);
              const videos = response.data.items;
              // Get scheduled and published videos
              const scheduledVideos = videos.filter((video) => {
                return (
                  new Date(video.status.publishAt) >= new Date() ||
                  new Date(video.snippet.publishedAt) <= new Date()
                );
              });
              console.log('-----------scheduledVideos======', scheduledVideos);
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
