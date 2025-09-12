import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await prisma.tiktokVideos.findMany({
    where: {
      publishedToPlatform: false,
    },
  });

  res.status(200).json({ videos: result });
}
