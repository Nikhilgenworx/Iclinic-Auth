import axios from "axios";
import { ENV } from "../config/env";

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept refresh or login/register calls — prevents loops
    const skipUrls = ["/auth/refresh", "/auth/login", "/auth/register"];
    if (skipUrls.some((url) => originalRequest.url?.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${ENV.API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        // Don't redirect — let the AuthContext handle unauthenticated state
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
