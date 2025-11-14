// ===================================================
// src/app/api/auth/signin/route.ts
// ===================================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { User } from "@/components/server/models/User.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { generateAccessToken, generateRefreshToken } from "@/components/server/utils/token";

// ---------------------------------------------------
// STRICT INPUT TYPE
// ---------------------------------------------------

interface SigninPayload {
  identifier: string; // email or phone
  password: string;
}

// ---------------------------------------------------
// POST — SIGNIN ROUTE
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body: SigninPayload = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return errorResponse("Identifier & password are required", 400);
    }

    const user = await User.findByIdentifier(identifier).select("+password");

    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    // -----------------------------
    // ACCOUNT LOCK CHECK
    // -----------------------------
    if (user.lockUntil && user.lockUntil > new Date()) {
      return errorResponse("Account temporarily locked. Try again later.", 403);
    }

    // -----------------------------
    // PASSWORD CHECK
    // -----------------------------
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 8) {
        user.lockUntil = new Date(Date.now() + 10 * 60 * 1000);
      }

      await user.save();
      return errorResponse("Invalid credentials", 401);
    }

    // -----------------------------
    // RESET ATTEMPTS ON SUCCESS
    // -----------------------------
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    user.lastLogin = new Date();
    user.lastLoginIP = req.headers.get("x-forwarded-for") ?? "unknown";

    await user.save();

    // -----------------------------
    // GENERATE TOKENS
    // -----------------------------
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // -----------------------------
    // SET COOKIES
    // -----------------------------
    const response = NextResponse.json(
      successResponse("Login successful", {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      })
    );

    // Access Token cookie
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Refresh Token cookie
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("SIGNIN ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
