import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import { generateAccessToken, generateRefreshToken } from "@/server/utils/token";
import { errorResponse, successResponse } from "@/server/utils/response";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) return errorResponse("Refresh token missing", 401);

    let payload: { userId: string };
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as { userId: string };
    } catch {
      return errorResponse("Invalid refresh token", 401);
    }

    const user = await User.findById(payload.userId).lean();
    if (!user) return errorResponse("User not found", 404);

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // ✅ IMPORTANT: successResponse already returns NextResponse (assumption from your utils)
    const response = successResponse("Token refreshed successfully");

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
