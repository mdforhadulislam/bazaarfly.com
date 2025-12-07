// src/services/analytics.service.ts
import { api } from "./axiosInstance";

export const AnalyticsService = {
  daily: () => api.get("/analytics/daily"),
  traffic: () => api.get("/analytics/traffic"),
  performance: () => api.get("/analytics/performance"),
};
