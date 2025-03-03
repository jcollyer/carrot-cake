import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const referenceId = req.query.id;
  if (req.method === "DELETE" && typeof referenceId === "string") {
    const reference = await prisma.reference.delete({
      where: { id: referenceId },
    });
    res.json(reference);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}
