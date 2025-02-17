import { NextApiRequest, NextApiResponse } from "next";
import { signOut } from "firebase/auth";
import { auth } from "@/pages/api/firebase/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await signOut(auth);
    res.status(200).json({ message: "Successfully signed out" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
