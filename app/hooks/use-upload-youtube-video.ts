import { SanitizedVideoProps } from "@/types";
import { getCookie } from "cookies-next";
import { YT_UPLOAD_URL } from "@/app/constants";

type useUploadYoutubeVideoProps = {
  accessToken: string;
  video: SanitizedVideoProps;
  videos: SanitizedVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<SanitizedVideoProps[]>>;
};

export const useUploadYoutubeVideo = async ({
  accessToken,
  video,
  videos,
  setVideos,
}: useUploadYoutubeVideoProps) => {
  const tokens = getCookie("youtube-tokens");
  try {
    const location = await fetch(
      YT_UPLOAD_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${String(accessToken)}`,
        },
        body: JSON.stringify({
          snippet: {
            categoryId: video.categoryId,
            description: video.description,
            title: video.title,
            tags: video.tags,
          },
          status: {
            privacyStatus: "private",
            publishAt: new Date(video.scheduleDate ?? new Date()).toISOString(),
          },
        }),
      }
    );

    // Url to upload video file from the location header
    const videoUrl = await location.headers.get("Location");
    const res = await fetch(`${videoUrl}`, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
      },
      body: video.file,
    });

    if (!res.ok) {
      console.error("Error uploading video:", res.statusText);
      return;
    }

    if (res.status === 200) {
      // remove uploaded video
      setVideos(videos.filter((_, i) => i !== 0));
    }
  } catch {
    // If the access token is expired, refresh it and try again
    try {
      const refreshToken = JSON.parse(tokens as string)?.refresh_token;
      const refreshResponse = await fetch("/api/youtube/connect-yt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse) {
        console.error("No refresh response");
        return;
      }
      const refreshData = await refreshResponse.json();
      const config = refreshData?.res?.config;
      const { url, body, headers } = config;

      await fetch(url, {
        method: "POST",
        headers,
        body,
      }).then(async (res) => {
        const { access_token } = await res.json();
        // Try uploading the video again with the new access token
        await useUploadYoutubeVideo({ accessToken: access_token, video, videos, setVideos });
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  }
};
