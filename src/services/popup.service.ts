// src/services/popup.service.ts
import { api } from "./axiosInstance";

export const PopupService = {
  getAll: () => api.get("/popup"),
  create: (data: unknown) => api.post("/popup", data),
  getOne: (id: string) => api.get(`/popup/${id}`),
  update: (id: string, data: unknown) => api.put(`/popup/${id}`, data),
  delete: (id: string) => api.delete(`/popup/${id}`),
};
