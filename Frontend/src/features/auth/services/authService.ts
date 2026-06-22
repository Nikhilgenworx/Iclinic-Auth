import apiClient from "../../../lib/axios";

export interface RegisterPayload {
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  profile_completed: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  profile_completed: boolean;
  is_active: boolean;
}

export const authService = {
  register: (data: RegisterPayload) =>
    apiClient.post<TokenResponse>("/auth/register", data),

  login: (data: LoginPayload) =>
    apiClient.post<TokenResponse>("/auth/login", data),

  refresh: () => apiClient.post<TokenResponse>("/auth/refresh"),

  logout: () => apiClient.post("/auth/logout"),

  getMe: () => apiClient.get<UserResponse>("/users/me"),
};
