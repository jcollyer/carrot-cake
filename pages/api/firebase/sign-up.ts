import { NextApiRequest, NextApiResponse } from "next";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/pages/api/firebase/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;

  try {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        // ...
        res.status(200).json({ message: "Successfully signed up" });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        res.status(400).json({ message: errorMessage });
      });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
