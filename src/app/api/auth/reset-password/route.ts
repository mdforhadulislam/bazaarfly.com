// ===================================================
// src/app/api/auth/reset-password/route.ts
// ===================================================

import { NextRequest } from "next/server";
import crypto from "crypto";
import dbConnect from "@/components/server/config/dbConnect";
import { User } from "@/components/server/models/User.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";

// ---------------------------------------------------
// STRICT TYPE
// ---------------------------------------------------

interface ResetPasswordPayload {
  token: string;
  email: string;
  newPassword: string;
}

// ---------------------------------------------------
// POST — RESET PASSWORD
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body: ResetPasswordPayload = await req.json();
    const { token, email, newPassword } = body;

    // -------------------------
    // 1. Validate Input
    // -------------------------
    if (!token || !email || !newPassword) {
      return errorResponse("Missing required fields", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    // -------------------------
    // 2. Hash token for lookup
    // -------------------------
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // -------------------------
    // 3. Find user with valid token
    // -------------------------
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse("Invalid or expired reset token", 400);
    }

    // -------------------------
    // 4. Update password (User Model method)
    // -------------------------
    await user.setNewPassword(newPassword);

    // -------------------------
    // 5. Success response
    // -------------------------
    return successResponse("Password has been reset successfully");
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
