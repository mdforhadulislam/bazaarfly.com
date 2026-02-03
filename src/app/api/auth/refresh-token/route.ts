// ===================================================
// src/app/api/auth/refresh-token/route.ts
// ===================================================

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/server/utils/token";
import { errorResponse, successResponse } from "@/server/utils/response";

// ---------------------------------------------------
// POST — REFRESH TOKEN
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // -----------------------------------------
    // 1. Read refresh token from cookies
    // -----------------------------------------
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return errorResponse("Refresh token missing", 401);
    }

    // -----------------------------------------
    // 2. Verify refresh token
    // -----------------------------------------
    let payload: { userId: string };

    try {
      payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as { userId: string };
    } catch {
      return errorResponse("Invalid refresh token", 401);
    }

    // -----------------------------------------
    // 3. Validate user
    // -----------------------------------------
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // -----------------------------------------
    // 4. Generate new access + refresh tokens
    // -----------------------------------------
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // -----------------------------------------
    // 5. Prepare response with new cookies
    // -----------------------------------------
    const response = NextResponse.json(
      successResponse("Token refreshed successfully")
    );

    // -> Access Token (1 day)
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // -> Refresh Token (7 days)
    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
