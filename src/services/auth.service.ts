// ===================================================
// src/services/auth.service.ts
// ===================================================

import { ApiResponse } from "../server/utils/response"; 
import { api } from "./axiosInstance";


// ---------------------------------------------------
// TYPES
// ---------------------------------------------------

export interface SignupPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface SigninPayload {
  identifier: string; // email or phone
  password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  newPassword: string;
}

export interface AffiliateApplyPayload {
  message?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  role: "user" | "affiliate" | "admin";
  isEmailVerified: boolean;
}

// ---------------------------------------------------
// SERVICE
// ---------------------------------------------------

export const AuthService = {
  // -------------------------------
  // SIGNUP
  // -------------------------------
  signup: async (
    payload: SignupPayload
  ): Promise<ApiResponse<{ userId: string; email: string }>> => {
    const res = await api.post<ApiResponse<{ userId: string; email: string }>>(
      "/auth/signup",
      payload
    );
    return res.data;
  },

  // -------------------------------
  // SIGNIN
  // -------------------------------
  signin: async (
    payload: SigninPayload
  ): Promise<ApiResponse<AuthUser>> => {
    const res = await api.post<ApiResponse<AuthUser>>(
      "/auth/signin",
      payload
    );
    return res.data;
  },

  // -------------------------------
  // SIGNOUT (POST or GET optional)
  // -------------------------------
  signout: async (): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>("/auth/signout");
    return res.data;
  },

  // -------------------------------
  // VERIFY EMAIL
  // -------------------------------
  verifyEmail: async (
    payload: VerifyEmailPayload
  ): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>(
      "/auth/verify-email",
      payload
    );
    return res.data;
  },

  // -------------------------------
  // FORGOT PASSWORD
  // -------------------------------
  forgotPassword: async (
    payload: ForgotPasswordPayload
  ): Promise<ApiResponse<string | null>> => {
    const res = await api.post<ApiResponse<string | null>>(
      "/auth/forgot-password",
      payload
    );
    return res.data;
  },

  // -------------------------------
  // RESET PASSWORD
  // -------------------------------
  resetPassword: async (
    payload: ResetPasswordPayload
  ): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>(
      "/auth/reset-password",
      payload
    );
    return res.data;
  },

  // -------------------------------
  // REFRESH TOKEN (POST)
  // -------------------------------
  refreshToken: async (): Promise<ApiResponse<string | null>> => {
    const res = await api.post<ApiResponse<string | null>>(
      "/auth/refresh-token"
    );
    return res.data;
  },

  // -------------------------------
  // APPLY FOR AFFILIATE PROGRAM
  // -------------------------------
  applyAffiliate: async (
    payload: AffiliateApplyPayload
  ): Promise<ApiResponse<any>> => {
    const res = await api.post<ApiResponse<any>>(
      "/auth/affiliate",
      payload
    );
    return res.data;
  },
} as const;
