export const runtime = "edge";
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default async function GET(req: Request) {
  const instagramVideos = await fetch(
    `${baseUrl}/api/instagram/schedule-videos/get-all`,
  );
  const instagramVideosData = await instagramVideos.json();
  let videosPosted = 0;

  if (!instagramVideosData.videos.length) {
    console.log("No videos to post");
    return Response.json({ message: "No videos to post" });
  }

  for (const video of instagramVideosData.videos) {
    const {
      accessToken,
      InstagramuserId,
      videoUrl,
      videoType,
      videoCaption,
      scheduledDate,
    } = video;

    if (new Date(scheduledDate) > new Date()) {
      console.log(
        `video: "${videoUrl}" scheduledDate is in the future:`,
        scheduledDate,
      );
    } else {
      // Update the Neon database to set publishedToPlatform to true
      try {
        const response = await fetch(
          `${baseUrl}/api/instagram/schedule-videos/mark-as-published`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoUrl,
            }),
          },
        );
        const data = await response.json();
        if (response.ok) {
          console.log("Database updated successfully:", data);
        } else {
          console.error("Error updating database:", data);
        }
      } catch (error) {
        throw new Error(
          `error putting to api/instagram/schedule-videos/mark-as-published: ${error}`,
        );
      }
      // Post the video to Instagram
      try {
        const response = await fetch(`${baseUrl}/api/instagram/post-video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            igUserId: InstagramuserId,
            videoUrl: videoUrl,
            videoType: videoType,
            videoCaption: videoCaption,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Video posted successfully:", data);
        } else {
          console.error("Error posting video:", data);
        }
      } catch (error) {
        throw new Error(`error posting to api/instagram/post-video: ${error}`);
      }
      // Remove the video from S3 bucket
      try {
        const response = await fetch(
          `${baseUrl}/api/s3/delete?fileName=${videoUrl}&s3Bucket=AWS_S3_IG_BUCKET_NAME&region=us-east-2`,
        );
        const data = await response.json();
        console.log("File removed from S3:", data);
      } catch (error) {
        throw new Error(`error deleting from api/s3/delete: ${error}`);
      }

      videosPosted++;
    }
  }
  console.log(
    `Cron job executed successfully with ${videosPosted} videos posted`,
  );
  return Response.json({
    message: `Cron job executed successfully with ${videosPosted} videos posted`,
  });
}
