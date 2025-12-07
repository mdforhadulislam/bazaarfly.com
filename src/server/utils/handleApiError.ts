// src/utils/handleApiError.ts

import { AxiosError } from "axios";

/**
 * Unified API Error Object
 */
export interface ParsedApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string> | string | null;
}

/**
 * Convert ANY backend or axios error → clean object
 */
export function handleApiError(error: unknown): ParsedApiError {
  // Axios Error (API request)
  if (error instanceof AxiosError) {
    const response = error.response;

    if (response && response.data) {
      return {
        message: response.data.message || "Something went wrong!",
        statusCode: response.status,
        errors: response.data.errors || null,
      };
    }

    return {
      message: "Network error. Please check connection.",
      statusCode: 0,
      errors: null,
    };
  }

  // Normal JS Error
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 0,
      errors: null,
    };
  }

  // Unknown error fallback
  return {
    message: "Unexpected error occurred.",
    statusCode: 0,
    errors: null,
  };
}
