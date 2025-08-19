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

    if (new Date(scheduledDate) <= new Date()) {
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
        console.log("Video posted successfully:--------", data);
      } catch (error) {
        throw new Error(`error posting to api/instagram/post-video: ${error}`);
      }
    }
  }

  return Response.json({ message: "Cron job executed successfully" });
}
