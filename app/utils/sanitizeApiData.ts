import moment from "moment";
import {
  SanitizedVideoProps,
  InstagramVideo,
  YouTubeVideo,
  TikTokVideo,
  NeonTikTokVideo,
  InstagramVideoFromPlatform,
} from "@/types";

export const sanitizeYTMetadata = (
  videos: YouTubeVideo[] | undefined
): SanitizedVideoProps[] | undefined => {
  return videos?.map((video) => {
    const { snippet, status } = video;
    const { title, description, categoryId, tags, thumbnails } = snippet;
    const { publishAt } = status || {};
    const thumbnail =
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      thumbnails?.default?.url ||
      "";
    return {
      id: video.id,
      title,
      description,
      categoryId,
      tags: tags,
      thumbnail,
      scheduleDate: moment(publishAt || snippet.publishedAt || "").format(
        "YYYY-MM-DD"
      ),
    };
  });
};

export const sanitizeTikTokMetadata = (
  videos: NeonTikTokVideo[] | TikTokVideo[] | undefined
): SanitizedVideoProps[] | undefined => {
  return videos?.map((video) => {
    const videoFromTikTokPlatform =
      (video as TikTokVideo).cover_image_url !== undefined;
    if (videoFromTikTokPlatform) {
      const { id, cover_image_url, create_time, title, video_description } =
        video as TikTokVideo;
      if (typeof create_time === "number") {
        return {
          id,
          title,
          description: video_description || title,
          scheduleDate: new Date(create_time * 1000)
            .toISOString()
            .split("T")[0],
          thumbnail: cover_image_url,
        };
      }
    }
    // Otherwise it's from Neon
    const { id, thumbnail, scheduledDate, title } = video as NeonTikTokVideo;
    return {
      id,
      title,
      description: title,
      scheduleDate: moment(scheduledDate).format("YYYY-MM-DD"),
      thumbnail,
    };
  });
};

export const sanitizeInstagramMetadata = (
  videos: InstagramVideo[] | InstagramVideoFromPlatform[] | undefined
): SanitizedVideoProps[] | undefined => {
  return videos?.map((video) => {
    const videoFromInstagramPlatform =
      (video as InstagramVideoFromPlatform).media_url !== undefined;
    if (videoFromInstagramPlatform) {
      const { id, caption, media_url, timestamp } =
        video as InstagramVideoFromPlatform;
      return {
        id,
        title: caption || "",
        description: "",
        scheduleDate: moment(timestamp).format("YYYY-MM-DD"),
        thumbnail: media_url,
        mediaType: "VIDEO"
      };
    }
    const { id, thumbnail, scheduledDate, videoCaption } =
      video as InstagramVideo;
    return {
      id,
      title: videoCaption || "",
      description: "",
      scheduleDate: moment(scheduledDate).format("YYYY-MM-DD"),
      thumbnail,
      mediaType: "VIDEO",
    };
  });
};
