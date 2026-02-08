import { successResponse } from "@/server/utils/response";

export async function POST() {
  const response = successResponse("Logged out successfully");

  const isProd = true

  // Clear access token
  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear refresh token
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
