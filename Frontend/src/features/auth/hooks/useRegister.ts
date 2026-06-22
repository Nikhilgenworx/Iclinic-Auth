import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AxiosError } from "axios";

export function useRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (
    email: string,
    password: string,
    role?: string
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      await register(email, password, role);
      navigate("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setError(axiosErr.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, error, isLoading };
}
