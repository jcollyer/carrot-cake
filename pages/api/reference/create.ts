import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { referenceTitle, referenceValue, referenceType, publish } = req.body;

  const result = await prisma.reference.create({
    data: {
      title: referenceTitle,
      value: referenceValue,
      type: referenceType,
      publish: publish,
    },
  });
  res.json(result);

  res.end();
}
