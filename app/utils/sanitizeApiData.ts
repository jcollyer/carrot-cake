import moment from "moment";
import {
  SanitizedVideoProps,
  InstagramVideo,
  YouTubeVideo,
  TikTokVideo,
  NeonTikTokVideo,
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
  videos: NeonTikTokVideo[] | undefined
): SanitizedVideoProps[] | undefined => {

  return videos?.map((video) => {
    return {
      id: video.id,
      title: video.title,
      description: video.title,
      scheduleDate: moment(video.scheduledDate).format("YYYY-MM-DD"),
      thumbnail: video.thumbnail,
    };
  });
};

export const sanitizeInstagramMetadata = (
  videos: InstagramVideo[] | undefined
): SanitizedVideoProps[] | undefined => {
  return videos?.map((video) => {
    const { id, thumbnail, scheduledDate, videoCaption } = video;
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
