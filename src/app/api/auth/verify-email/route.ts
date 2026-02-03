// ===================================================
// src/app/api/auth/verify-email/route.ts
// ===================================================

import { NextRequest } from "next/server";
import crypto from "crypto";
import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import { successResponse, errorResponse } from "@/server/utils/response";

// ---------------------------------------------------
// POST — VERIFY EMAIL
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const token: string | undefined = body?.token;

    // -----------------------------------
    // 1. Validate input
    // -----------------------------------
    if (!token || typeof token !== "string") {
      return errorResponse("Verification token is required", 400);
    }

    // -----------------------------------
    // 2. Hash token (matches User model)
    // -----------------------------------
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // -----------------------------------
    // 3. Find matching user
    // -----------------------------------
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return errorResponse(
        "Invalid or expired verification token",
        400
      );
    }

    // -----------------------------------
    // 4. Mark email as verified
    // -----------------------------------
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // -----------------------------------
    // 5. Send success response
    // -----------------------------------
    return successResponse(
      "Email verified successfully! You can now sign in."
    );
  } catch (error) {
    console.error("EMAIL VERIFY ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
