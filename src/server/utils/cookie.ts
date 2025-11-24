import { NextResponse } from "next/server";

export const setAuthCookies = (
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) => {
  // Access Token Cookie
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Refresh Token Cookie
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
};

// Optional: clear cookies (logout)
export const clearAuthCookies = (res: NextResponse) => {
  res.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
};
