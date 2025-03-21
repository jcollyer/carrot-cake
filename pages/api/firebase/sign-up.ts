import { NextApiRequest, NextApiResponse } from "next";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/pages/api/firebase/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;

  try {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        return createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            res.status(200).json({ user });
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(400).json({ message: errorMessage, errorCode });
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).json({ message: errorMessage, errorCode });
      });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
