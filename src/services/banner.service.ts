// src/services/banner.service.ts
import { api } from "./axiosInstance";

export interface BannerData {
  // Define the properties of a banner, for example:
  title: string;
  imageUrl?: string;
  link?: string;
  // Add other fields as needed
}

export const BannerService = {
  getAll: () => api.get("/banner"),
  create: (data: BannerData) => api.post("/banner", data),
  getOne: (id: string) => api.get(`/banner/${id}`),
  update: (id: string, data: BannerData) => api.put(`/banner/${id}`, data),
  delete: (id: string) => api.delete(`/banner/${id}`),
};
