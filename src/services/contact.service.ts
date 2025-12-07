// src/services/contact.service.ts
import { api } from "./axiosInstance";

export type ContactInput = {
  name?: string;
  email?: string;
  message?: string;
  [key: string]: unknown;
};

export const ContactService = {
  create: (data: ContactInput) => api.post("/contact", data),
  getAll: () => api.get("/contact"),
  getOne: (id: string) => api.get(`/contact/${id}`),
  update: (id: string, data: ContactInput) => api.patch(`/contact/${id}`, data),
  delete: (id: string) => api.delete(`/contact/${id}`),
};
