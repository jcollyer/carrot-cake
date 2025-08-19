export const runtime = "edge";
import { NextResponse } from "next/server";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instagramVideos = await fetch(
    `${baseUrl}/api/instagram/scheduled-videos/get-all`
  );
  const instagramVideosData = await instagramVideos.json();

  for (const video of instagramVideosData.videos) {
    const {
      accessToken,
      InstagramuserId,
      videoUrl,
      videoType,
      videoCaption,
      scheduledDate,
    } = video;

    if (new Date(String(scheduledDate)) <= new Date()) {
      fetch(`${baseUrl}/api/instagram/post-video`, {
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
      })
        .then(async (data) => {
          console.log("Video posted successfully:--------", data);
        })
        .catch((error) => {
          throw new Error(`Scheduled date is in the future, skipping video post.------------${
            new Date(scheduledDate) <= new Date()
          },  accessToken: ${accessToken}
      InstagramuserId: ${InstagramuserId}
      videoUrl: ${videoUrl}
      videoType: ${videoType}
      videoCaption: ${videoCaption}
      scheduledDate: ${scheduledDate}, error: ${error.message}`);
        });
    }
  }

  return Response.json({ message: "Cron job executed successfully" });
}
