// src/services/order.service.ts
import { api } from "./axiosInstance";

export const OrderService = {
  getAll: () => api.get("/order"),
  create: (data: any) => api.post("/order", data),

  getOne: (id: string) => api.get(`/order/${id}`),
  update: (id: string, data: any) => api.put(`/order/${id}`, data),

  createPayment: (id: string, data: any) => api.post(`/order/${id}/payment`, data),
};
