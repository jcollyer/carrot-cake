import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    message: "This is the Instagram callback endpoint.",
    // You can add more logic here if needed, such as handling tokens or user data
  });
}
