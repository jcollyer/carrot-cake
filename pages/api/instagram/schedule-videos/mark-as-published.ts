import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const videoUrl = req.body.videoUrl;
  try {
    const updatedVideo = await prisma.instagramVideos.updateMany({
      where: {
        videoUrl: videoUrl,
      },
      data: {
        publishedToPlatform: true,
      },
    });

    if (updatedVideo.count === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.status(200).json({
      message: "Video marked as published successfully",
      updatedCount: updatedVideo.count,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error updating video" });
  }
}
