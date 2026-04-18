import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChC_xLY_JYAVObfP278XHNEvrkJBeI3gA",
  authDomain: "national-id-system-b0cb3.firebaseapp.com",
  projectId: "national-id-system-b0cb3",
  storageBucket: "national-id-system-b0cb3.appspot.com",
  messagingSenderId: "367723872206",
  appId: "1:367723872206:web:300a27aec2e2c973e9b59f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);