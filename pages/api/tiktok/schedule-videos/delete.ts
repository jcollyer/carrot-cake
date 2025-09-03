import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await prisma.tiktokVideos.deleteMany({
      where: {
        scheduledDate: {
          lte: new Date(),
        },
      },
    });
    console.log(`Deleted ${result.count} items.`);
  } catch (error) {
    throw new Error("Error deleting items: " + error);
  } finally {
    await prisma.$disconnect();
  }

  res.status(200).json({ message: "Scheduled videos deleted successfully" });
}
