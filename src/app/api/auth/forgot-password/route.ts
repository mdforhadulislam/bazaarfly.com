// ===================================================
// src/app/api/auth/forgot-password/route.ts
// ===================================================

import { NextRequest } from "next/server";
import crypto from "crypto";
import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import { successResponse, errorResponse } from "@/server/utils/response";
import { passwordResetEmail } from "@/server/templates/EmailTemplates";
import { sendEmail } from "@/server/lib/emailService";

// ---------------------------------------------------
// STRICT INPUT TYPE
// ---------------------------------------------------

interface ForgotPasswordPayload {
  email: string;
}

// ---------------------------------------------------
// POST — FORGOT PASSWORD ROUTE
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body: ForgotPasswordPayload = await req.json();
    const { email } = body;

    // ------------------------------------------
    // 1. Validate Input
    // ------------------------------------------
    if (!email) {
      return errorResponse("Email is required", 400);
    }

    // ------------------------------------------
    // 2. Find User
    // ------------------------------------------
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Do NOT reveal user existence
      return successResponse("If your email exists, a reset link was sent.");
    }

    // ------------------------------------------
    // 3. Generate Reset Token (From Model Method)
    // ------------------------------------------
    const rawToken = user.generatePasswordResetToken();
    await user.save();

    // ------------------------------------------
    // 4. Build Reset URL
    // ------------------------------------------
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${rawToken}&email=${email}`;

    // ------------------------------------------
    // 5. Email Template
    // ------------------------------------------
    const emailTemplate = passwordResetEmail({
      name: user.name,
      resetLink: resetUrl,
    });

    // ------------------------------------------
    // 6. Send Email
    // ------------------------------------------
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // ------------------------------------------
    // 7. Success Response
    // ------------------------------------------
    return successResponse(
      "Password reset link sent to your email"
    );
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
