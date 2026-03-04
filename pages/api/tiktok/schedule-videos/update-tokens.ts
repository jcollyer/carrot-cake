import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const videoUrl = req.body.videoUrl;
  const accessToken = req.body.accessToken;
  const refreshToken = req.body.refreshToken;
  console.log(
    `update access token and refreshtoken:------------ videoUrl: ${videoUrl}, accessToken: ${accessToken}, refreshToken: ${refreshToken}`,
  );
  try {
    const updatedVideo = await prisma.tiktokVideos.updateMany({
      where: {
        videoUrl: videoUrl,
      },
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
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
