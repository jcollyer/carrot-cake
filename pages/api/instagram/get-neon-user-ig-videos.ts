import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized!!" });
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const videos = await prisma.instagramVideos.findMany({
    where: {
      userId: user.id,
    },
  });

  res.status(200).json({ videos });
}
