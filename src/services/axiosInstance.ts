// src/services/axiosInstance.ts

import axios from "axios"; 
import { handleApiError } from "../server/utils/handleApiError";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

// Refresh Token Handler
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Auto handle token refresh
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        await api.post("/auth/refresh-token");
        return api(original);
      } catch (refreshError) {
        console.log("Refresh token failed");
      }
    }

    // Global error handler
    throw handleApiError(err);
  }
);
