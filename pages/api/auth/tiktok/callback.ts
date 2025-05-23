import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    console.log("callback------->>", {req, res});

  res.status(200).json({ url:"111------------------------1111s" });
}