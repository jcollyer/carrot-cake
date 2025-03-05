
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  name: "Carrot Cake",
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "carrot-cake-e6514.firebaseapp.com",
  projectId: "carrot-cake-e6514",
  storageBucket: "carrot-cake-e6514.firebasestorage.app",
  messagingSenderId: "633551319770",
  appId: process.env.FIREBASE_APP_ID,
  measurementId: "G-SW4WVE4S6E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
