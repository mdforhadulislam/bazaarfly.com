// src/services/affiliate.service.ts
import { api } from "./axiosInstance";

export const AffiliateService = {
  getAll: () => api.get("/affiliate"),
  getOne: (code: string) => api.get(`/affiliate/${code}`),
  update: (code: string, data: unknown) => api.put(`/affiliate/${code}`, data),
  profile: (code: string) => api.get(`/affiliate/${code}/profile`),
  updateProfile: (code: string, data: unknown) => api.put(`/affiliate/${code}/profile`, data),
  links: (code: string) => api.get(`/affiliate/${code}/link`),
  createLink: (code: string, data: unknown) => api.post(`/affiliate/${code}/link`, data),
  getLink: (code: string, id: string) => api.get(`/affiliate/${code}/link/${id}`),
  updateLink: (code: string, id: string, data: unknown) => api.put(`/affiliate/${code}/link/${id}`, data),
  deleteLink: (code: string, id: string) => api.delete(`/affiliate/${code}/link/${id}`),
  wallet: (code: string) => api.get(`/affiliate/${code}/wallet`),
  walletTx: (code: string, id: string) => api.get(`/affiliate/${code}/wallet/${id}`),
  withdraw: (code: string, data: unknown) => api.post(`/affiliate/${code}/withdraw`, data),
  getWithdraw: (code: string) => api.get(`/affiliate/${code}/withdraw`),
  updateWithdraw: (code: string, id: string, data: unknown) => api.put(`/affiliate/${code}/withdraw/${id}`, data),
  conversions: (code: string) => api.get(`/affiliate/${code}/conversions`),
  conversion: (code: string, id: string) => api.get(`/affiliate/${code}/conversions/${id}`),
  commissions: (code: string) => api.get(`/affiliate/${code}/commissions`),
  commission: (code: string, id: string) => api.get(`/affiliate/${code}/commissions/${id}`),
};

