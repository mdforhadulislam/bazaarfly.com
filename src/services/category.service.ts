// src/services/category.service.ts
import { api } from "./axiosInstance";

export interface CategoryData {
  name: string;
  description?: string;
  // Add other fields as needed
}

export const CategoryService = {
  getAll: () => api.get("/category"),
  create: (data: CategoryData) => api.post("/category", data),
  getOne: (slug: string) => api.get(`/category/${slug}`),
  update: (slug: string, data: CategoryData) => api.put(`/category/${slug}`, data),
  delete: (slug: string) => api.delete(`/category/${slug}`),

  uploadImage: (slug: string, type: "image" | "icon" | "banner", file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.patch(`/category/${slug}?type=${type}`, form);
  },

  getProducts: (slug: string) => api.get(`/category/${slug}/product`),
};
