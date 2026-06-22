import axios from "axios";
import { ENV } from "../config/env";

const backendClient = axios.create({
  baseURL: ENV.BACKEND_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access_token from cookie or localStorage as Bearer header
backendClient.interceptors.request.use((config) => {
  // Read access_token from the auth response stored in memory/localStorage
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

backendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token via Auth-Backend
        const res = await axios.post(
          `${ENV.API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Store the new access token
        const newToken = res.data.access_token;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        isRefreshing = false;
        return backendClient(originalRequest);
      } catch {
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Simple in-memory token store
let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken;
  // Fallback: try localStorage
  return localStorage.getItem("access_token");
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

export default backendClient;
