import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/pages/api/firebase/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await auth.authStateReady();
  const user = auth.currentUser;
  res.status(200).json({ user });
}
