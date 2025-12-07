// src/services/product.service.ts
import { api } from "./axiosInstance";

export const ProductService = {
  getAll: () => api.get("/product"),
  create: (data: any) => api.post("/product", data),

  getOne: (slug: string) => api.get(`/product/${slug}`),
  update: (slug: string, data: any) => api.put(`/product/${slug}`, data),
  delete: (slug: string) => api.delete(`/product/${slug}`),

  uploadImages: (slug: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    return api.patch(`/product/${slug}`, form);
  },
};
