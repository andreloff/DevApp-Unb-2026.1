import { FirebaseApp, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "meau-app-unb20261-andre.firebaseapp.com",
  projectId: "meau-app-unb20261-andre",
  storageBucket: "meau-app-unb20261-andre.firebasestorage.app",
  messagingSenderId: "756135788781",
  appId: "1:756135788781:web:c1489dec43ef3717738ce4"
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export default app;