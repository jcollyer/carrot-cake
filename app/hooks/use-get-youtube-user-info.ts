import { YouTubeUserInfo } from "@/types";

export const useGetYouTubeUserInfo = async ({tokens}: {tokens?: string}): Promise<YouTubeUserInfo | null> => {
  const res = await fetch("/api/youtube/get-channel", {
    method: "GET",
    headers: {
      cookie: `youtube-tokens=${tokens}`,
    },
  });

  const { data } = await res.json();
  if (!data) return null;

  const { snippet, statistics } = data;
  const { title, thumbnails } = snippet;
  const { subscriberCount, videoCount, viewCount } = statistics;
  const { medium } = thumbnails;

  return {
    userName: title,
    thumbnail: medium.url,
    subscriberCount,
    videoCount,
    viewCount,
  };
};
