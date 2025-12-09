// ===================================================
// src/services/account.service.ts
// ===================================================

import api from "./axiosInstance";
import type { ApiResponse } from "./types";

// ===================================================
// TYPES
// ===================================================

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface UserAccount {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  avatar?: string;
  isDeleted?: boolean;
  isEmailVerified?: boolean;
}

export interface UpdateUserPayload {
  userId: string;
  updates: Record<string, string | number | boolean | unknown>;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface OrderItem {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface PaymentItem {
  _id: string;
  order: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

export interface OrderCreatePayload {
  items: Array<{ product: string; quantity: number; price: number }>;
  shippingAddress: string;
  shippingCost?: number;
  affiliate?: string | null;
  link?: string | null;
}

export interface PaymentCreatePayload {
  orderId?: string;
  amount: number;
  method: string;
  transactionId?: string;
  status?: string;
  gatewayResponse?: Record<string, unknown>;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  preferences?: Record<string, unknown>;
  notes?: string;
  avatar?: string;
}

// ===================================================
// SERVICE START
// ===================================================

export const AccountService = {
  // ===================================================
  // ADMIN USER LIST
  // ===================================================
  getUsers: async (params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ users: UserAccount[]; pagination: Pagination }>> => {
    const res = await api.get(
      "/account",
      { params }
    );
    return res.data;
  },

  // ===================================================
  // ADMIN UPDATE USER
  // ===================================================
  updateUser: async (
    payload: UpdateUserPayload
  ): Promise<ApiResponse<UserAccount>> => {
    const res = await api.put(
      "/account",
      payload
    );
    return res.data;
  },

  // ===================================================
  // ADMIN SOFT DELETE USER
  // ===================================================
  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete("/account", {
      params: { userId },
    });
    return res.data;
  },

  // ===================================================
  // ADMIN RESTORE USER
  // ===================================================
  restoreUser: async (userId: string): Promise<ApiResponse<null>> => {
    const res = await api.patch("/account", { userId });
    return res.data;
  },

  // ===================================================
  // NOTIFICATIONS
  // ===================================================
  getNotifications: async (
    phone: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ notifications: NotificationItem[]; pagination: Pagination }>> => {
    const res = await api.get(`/notifications/${phone}`, {
      params: { page, limit },
    });
    return res.data;
  },

  updateNotification: async (
    phone: string,
    payload: { id: string; markRead?: boolean }
  ): Promise<ApiResponse<NotificationItem>> => {
    const res = await api.patch(`/notifications/${phone}`, payload);
    return res.data;
  },

  deleteNotification: async (
    phone: string,
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/notifications/${phone}`, {
      params: { id },
    });
    return res.data;
  },

  // ===================================================
  // ORDERS (LIST / CREATE / CANCEL)
  // ===================================================
  getOrders: async (
    phone: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<ApiResponse<{ orders: OrderItem[]; pagination: Pagination }>> => {
    const res = await api.get(`/orders/${phone}`, {
      params,
    });
    return res.data;
  },

  createOrder: async (
    phone: string,
    payload: OrderCreatePayload
  ): Promise<ApiResponse<OrderItem>> => {
    const res = await api.post(`/orders/${phone}`, payload);
    return res.data;
  },

  cancelOrder: async (
    phone: string,
    id: string
  ): Promise<ApiResponse<{ id: string }>> => {
    const res = await api.delete(`/orders/${phone}`, {
      params: { id },
    });
    return res.data;
  },

  // ===================================================
  // SINGLE ORDER
  // ===================================================
  getSingleOrder: async (
    phone: string,
    id: string
  ): Promise<ApiResponse<OrderItem>> => {
    const res = await api.get(`/orders/${phone}/${id}`);
    return res.data;
  },

  replaceOrder: async (
    id: string,
    payload: Record<string, unknown>
  ): Promise<ApiResponse<OrderItem>> => {
    const res = await api.put(`/orders/order/${id}`, payload);
    return res.data;
  },

  updateOrder: async (
    id: string,
    payload: Record<string, unknown>
  ): Promise<ApiResponse<OrderItem>> => {
    const res = await api.patch(`/orders/order/${id}`, payload);
    return res.data;
  },

  deleteOrderHard: async (
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/orders/order/${id}`);
    return res.data;
  },

  // ===================================================
  // ORDER PAYMENT
  // ===================================================
  getOrderPayment: async (
    phone: string,
    id: string
  ): Promise<ApiResponse<PaymentItem>> => {
    const res = await api.get(`/order-payment/${phone}/${id}`);
    return res.data;
  },

  createOrderPayment: async (
    phone: string,
    id: string,
    payload: PaymentCreatePayload
  ): Promise<ApiResponse<PaymentItem>> => {
    const res = await api.post(`/order-payment/${phone}/${id}`, payload);
    return res.data;
  },

  replaceOrderPayment: async (
    phone: string,
    id: string,
    payload: Record<string, unknown>
  ): Promise<ApiResponse<PaymentItem>> => {
    const res = await api.put(`/order-payment/${phone}/${id}`, payload);
    return res.data;
  },

  updateOrderPayment: async (
    phone: string,
    id: string,
    payload: Record<string, unknown>
  ): Promise<ApiResponse<PaymentItem>> => {
    const res = await api.patch(`/order-payment/${phone}/${id}`, payload);
    return res.data;
  },

  deleteOrderPayment: async (
    phone: string,
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/order-payment/${phone}/${id}`);
    return res.data;
  },

  // ===================================================
  // PAYMENT LIST / CREATE / DELETE
  // ===================================================
  getPayments: async (
    phone: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ payments: PaymentItem[]; pagination: Pagination }>> => {
    const res = await api.get(`/payments/${phone}`, {
      params: { page, limit },
    });
    return res.data;
  },

  createPayment: async (
    phone: string,
    payload: PaymentCreatePayload
  ): Promise<ApiResponse<PaymentItem>> => {
    const res = await api.post(`/payments/${phone}`, payload);
    return res.data;
  },

  deletePayment: async (
    phone: string,
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/payments/${phone}`, {
      params: { id },
    });
    return res.data;
  },

  // ===================================================
  // PROFILE
  // ===================================================
  getProfile: async (
    phone: string
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const res = await api.get(`/profile/${phone}`);
    return res.data;
  },

  updateProfile: async (
    phone: string,
    payload: ProfileUpdatePayload
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const res = await api.put(`/profile/${phone}`, payload);
    return res.data;
  },

  uploadAvatar: async (
    phone: string,
    file: File
  ): Promise<ApiResponse<{ avatar: string }>> => {
    const form = new FormData();
    form.append("avatar", file);

    const res = await api.post(`/profile/${phone}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
