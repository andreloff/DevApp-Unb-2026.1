import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  UserCredential
} from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);

export const registerUser = async (email: string, password: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};