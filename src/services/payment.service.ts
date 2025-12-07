// src/services/payment.service.ts
import { api } from "./axiosInstance";

export const PaymentService = {
  getAll: () => api.get("/payment"),
  create: (data: any) => api.post("/payment", data),

  getOne: (id: string) => api.get(`/payment/${id}`),
  update: (id: string, data: any) => api.put(`/payment/${id}`, data),
  delete: (id: string) => api.delete(`/payment/${id}`),
};
