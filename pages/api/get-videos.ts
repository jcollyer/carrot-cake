import { oauth } from "@/pages/api/connect-yt";
const Youtube = require("youtube-api");

export default async function handler(req, res) {
  const { playlistId } = req.body;
  const { cookie } = req.headers;
  const jsTokenCookie = cookie.split("; ").find((token) => {
    return token.startsWith("tokens=");
  });
  const jsonTokens = JSON.parse(
    decodeURIComponent(jsTokenCookie.split("tokens=j%3A")[1])
  );

  oauth.setCredentials(jsonTokens);

  Youtube.playlistItems
    .list({
      part: ["status, id, contentDetails"],
      playlistId: playlistId,
    })
    .then(
      (response) => {
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
            (response) => {
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
            (err) => {
              console.error("Execute error", err);
            }
          );
      },
      (err) => {
        console.error("Execute error", err);
      }
    );
}
