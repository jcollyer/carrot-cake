import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export default async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instagramVideos: Array<any> = await prisma.instagramVideos.findMany({
    where: {
      scheduledDate: {
        lte: new Date(),
      },
    },
  });
  console.log("---------", instagramVideos);

  for (const video of instagramVideos) {
    const {
      accessToken,
      InstagramuserId,
      videoUrl,
      videoType,
      videoCaption,
      scheduledDate,
    } = video;
    if (scheduledDate <= new Date()) {
      fetch("/api/instagram/post-video", {
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
          console.error("Error posting video:", error);
        });
    }
  }

  return NextResponse.json({ ok: true });
}
