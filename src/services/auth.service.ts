// src/services/auth.service.ts
import { api } from "./axiosInstance";

type SignupPayload = {
  email: string;
  password: string;
  name?: string;
  [key: string]: unknown;
};

type SigninPayload = {
  identifier: string;
  password: string;
  [key: string]: unknown;
};

type ResetPasswordPayload = {
  token: string;
  password: string;
  [key: string]: unknown;
};

export const AuthService = {
  signup: (data: SignupPayload) => api.post("/auth/signup", data),
  signin: (data: SigninPayload) => api.post("/auth/signin", data),
  signout: () => api.post("/auth/signout"),
  refresh: () => api.post("/auth/refresh-token"),
  verifyEmail: (token: string) => api.post("/auth/verify-email", { token }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (payload: ResetPasswordPayload) => api.post("/auth/reset-password", payload),
};
