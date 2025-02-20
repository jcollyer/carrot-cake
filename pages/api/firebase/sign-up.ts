import { NextApiRequest, NextApiResponse } from "next";
import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;
  const auth = getAuth();

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
