import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, videoUrl, videoType, videoCaption, scheduledDate, accessToken, InstagramuserId } = req.body;
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await prisma.instagramVideos.create({
    data: {
      videoUrl,
      videoType,
      videoCaption,
      scheduledDate,
      accessToken,
      InstagramuserId,
      userId,
      referenceOwner: {
        connectOrCreate: {
          where: {
            email: session?.user?.email,
          },
          create: {
            email: session?.user?.email,
            name: session?.user?.name,
          },
        },
      },
    },
  });
  res.json(result);

  res.end();
}
