export const runtime = "edge";
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default async function GET(req: Request) {
  const tiktokVideos = await fetch(
    `${baseUrl}/api/tiktok/schedule-videos/get-all`
  );
  const tiktokVideosData = await tiktokVideos.json();
  let videosPosted = 0;

  if (!tiktokVideosData.videos.length) {
    console.log("No videos to post");
  }

  for (const video of tiktokVideosData.videos) {
    const {
      accessToken,
      videoUrl,
      draft,
      title,
      privacyStatus,
      disableDuet,
      disableComment,
      disableStitch,
      brandedContent,
      yourBrand,
      scheduledDate,
    } = video;
  
    if (new Date(scheduledDate) > new Date()) {
      console.log(`video: "${title}" scheduledDate is in the future:`, scheduledDate);
    } else {
      // Post the video to TikTok
      const url = draft
        ? "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/"
        : "https://open.tiktokapis.com/v2/post/publish/video/init/";
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft: draft,
            post_info: {
              title: title,
              privacy_level: privacyStatus || "SELF_ONLY",
              disable_duet: disableDuet,
              disable_comment: disableComment,
              disable_stitch: disableStitch,
              video_cover_timestamp_ms: 1000,
              brand_content_toggle: brandedContent,
              brand_organic_toggle: yourBrand,
            },
            source_info: {
              video_url: videoUrl,
              source: "PULL_FROM_URL",
            },
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Video posted successfully:", data);
        } else {
          console.error("Error posting video:", data);
        }
      } catch (error) {
        throw new Error(`error posting to api/tiktok/direct-post-init: ${error}`);
      }
      // Updata the Neon database to set publishedToPlatform to true
      try {
        const response = await fetch(
          `${baseUrl}/api/tiktok/schedule-videos/mark-as-published`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoUrl,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log("Database updated successfully:", data);
        } else {
          console.error("Error updating database:", data);
        }
      } catch (error) {
        throw new Error(
          `error putting to api/tiktok/schedule-videos/mark-as-published: ${error}`
        );
      }
      // // Remove the video from S3 bucket
      // try {
      //   const response = await fetch(
      //     `${baseUrl}/api/s3/delete?fileName=${videoUrl}&s3Bucket=AWS_S3_TIKTOK_BUCKET_NAME&region=us-east-2`
      //   );
      //   const data = await response.json();
      //   console.log("File removed from S3:", data);
      // } catch (error) {
      //   throw new Error(`error deleting from api/s3/delete: ${error}`);
      // }

      videosPosted++;
    }
  }
  console.log(`Direct post executed successfully with ${videosPosted} videos posted`);
  return Response.json({ message: `Direct post executed successfully with ${videosPosted} videos posted` });
}
