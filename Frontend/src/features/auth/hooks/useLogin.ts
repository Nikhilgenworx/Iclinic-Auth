import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { AxiosError } from "axios";

export function useLogin() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setError(axiosErr.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, error, isLoading };
}
