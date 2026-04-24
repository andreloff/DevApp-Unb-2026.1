import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoiwL9DvNuw-WByMV464vkenOmru5vTDo",
  authDomain: "meau-unb-627d0.firebaseapp.com",
  projectId: "meau-unb-627d0",
  storageBucket: "meau-unb-627d0.firebasestorage.app",
  messagingSenderId: "803701688987",
  appId: "1:803701688987:web:a3589cdadcf27df44f143e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;