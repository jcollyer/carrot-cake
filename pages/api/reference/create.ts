import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { referenceTitle, referenceValue, referenceType, publish } = req.body;
  const session = await getServerSession(req, res, authOptions);

  const result = await prisma.reference.create({
    data: {
      title: referenceTitle,
      value: referenceValue,
      type: referenceType,
      publish: publish,
      referenceOwner: {
        connectOrCreate: {
          where: {
            // @ts-ignore
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
