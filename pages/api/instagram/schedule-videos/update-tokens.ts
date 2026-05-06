import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const videoUrl = req.body.videoUrl;
  const accessToken = req.body.accessToken;
  console.log(
    `update IG access token:------------ videoUrl: ${videoUrl}, accessToken: ${accessToken}`,
  );
  try {
    const updatedVideo = await prisma.instagramVideos.updateMany({
      where: {
        videoUrl: videoUrl,
      },
      data: {
        accessToken: accessToken,
      },
    });

    if (updatedVideo.count === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.status(200).json({
      message: "Video tokens updated successfully",
      updatedCount: updatedVideo.count,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error updating video" });
  }
}
