import { NextResponse } from "next/server";

// ==========================
// API RESPONSE INTERFACE
// ==========================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string> | string | null;
  statusCode: number;
  pagination?: PaginationMeta;
}

// Pagination Meta Type
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Error type-safe interface
export interface ApiError {
  message: string;
  details?: string | Record<string, string>;
}

// =============================
// SUCCESS RESPONSE
// =============================
export function successResponse<T>(
  message: string,
  data?: T,
  statusCode: number = 200
) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    statusCode,
  };

  return NextResponse.json(body, { status: statusCode });
}

// =============================
// CREATED RESPONSE
// =============================
export function createdResponse<T>(
  message: string,
  data?: T,
  statusCode: number = 201
) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    statusCode,
  };

  return NextResponse.json(body, { status: statusCode });
}

// =============================
// ERROR RESPONSE
// =============================
export function errorResponse(
  message: string = "Something went wrong",
  statusCode: number = 500,
  errors?: Record<string, string> | string | null
) {
  const body: ApiResponse<null> = {
    success: false,
    message,
    errors: errors ?? null,
    statusCode,
  };

  return NextResponse.json(body, { status: statusCode });
}

// =============================
// UNAUTHORIZED
// =============================
export function unauthorizedResponse(message = "Unauthorized access") {
  return errorResponse(message, 401);
}

// =============================
// FORBIDDEN
// =============================
export function forbiddenResponse(
  message = "You do not have permission to perform this action"
) {
  return errorResponse(message, 403);
}

// =============================
// NOT FOUND
// =============================
export function notFoundResponse(message = "Resource not found") {
  return errorResponse(message, 404);
}

// =============================
// VALIDATION ERROR
// =============================
export function validationErrorResponse(
  errors: Record<string, string>,
  message = "Validation failed"
) {
  return errorResponse(message, 422, errors);
}

// =============================
// PAGINATION RESPONSE
// =============================
export function paginatedResponse<T>(
  message: string,
  data: T[],
  pagination: PaginationMeta
) {
  const body: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination,
    statusCode: 200,
  };

  return NextResponse.json(body, { status: 200 });
}

// =============================
// SAFE TRY-CATCH WRAPPER
// TOTALLY TYPE-SAFE
// =============================
export async function tryCatch<T>(
  callback: () => Promise<T>
) {
  try {
    return await callback();
  } catch (err) {
    const errorObj: ApiError = {
      message: err instanceof Error ? err.message : "Unknown server error",
    };

    console.error("API ERROR:", errorObj);

    return errorResponse("Internal Server Error", 500, errorObj.message);
  }
}
