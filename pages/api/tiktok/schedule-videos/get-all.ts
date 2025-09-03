import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await await prisma.tiktokVideos.findMany({
    where: {
      scheduledDate: {
        lte: new Date(),
      },
    },
  });

  res.status(200).json({ videos: result });
}
