export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8001",
  BACKEND_BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000",
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000",
} as const;
