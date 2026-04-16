import { useState } from "react";
import { loginUser, registerUser } from "../services/auth";

export const useAuth = () => {
  const [error, setError] = useState<string>("");

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);

      console.log("Login com sucesso!");
      console.log("Usuário: ", user.user.email);
      setError("");
      return true
    } catch (err: unknown) {
        console.log("ERRO no Login!")
      if (err instanceof Error) {
        if (err.message.includes("auth/wrong-password")){
            console.log("Senha incorreta.")    
        } else if (err.message.includes("auth/user-not-found")){
            console.log("Usuário não existe") ;
        }
        setError(err.message);
      }
      return false;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const user = await registerUser(email, password);
      setError("");
      return user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return {
    handleLogin,
    handleRegister,
    error,
  };
};