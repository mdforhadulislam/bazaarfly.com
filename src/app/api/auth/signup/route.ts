// ===================================================
// src/app/api/auth/signup/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import { successResponse, errorResponse } from "@/server/utils/response";
import { emailVerificationEmail } from "@/server/templates/EmailTemplates";
import { sendEmail } from "@/server/lib/emailService";

// ---------------------------------------------------
// STRICT INPUT TYPE
// ---------------------------------------------------

interface SignupPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// ---------------------------------------------------
// VALIDATORS
// ---------------------------------------------------

const isValidEmail = (email: string): boolean =>
  /^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email);

const isValidPhone = (phone: string): boolean =>
  /^\+?[0-9]{6,14}$/.test(phone);

// ---------------------------------------------------
// POST — SIGNUP ROUTE
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body: SignupPayload = await req.json();
    const { name, email, phoneNumber, password } = body;

    // -------------------------------
    // 1. REQUIRED FIELDS
    // -------------------------------
    if (!name || !email || !phoneNumber || !password) {
      return errorResponse("All fields are required", 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse("Invalid email format", 400);
    }

    if (!isValidPhone(phoneNumber)) {
      return errorResponse("Invalid phone number", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    // -------------------------------
    // 2. DUPLICATE CHECK
    // -------------------------------
    const emailExists = await User.findOne({ email }).lean();
    if (emailExists) {
      return errorResponse("Email already exists", 409);
    }

    const phoneExists = await User.findOne({ phoneNumber }).lean();
    if (phoneExists) {
      return errorResponse("Phone number already exists", 409);
    }

    // -------------------------------
    // 3. CREATE USER (password hashing auto)
    // -------------------------------
    const user = new User({
      name,
      email,
      phoneNumber,
      password,
    });

    // -------------------------------
    // 4. USE MODEL INSTANCE METHOD
    // -------------------------------
    const rawToken = user.generateEmailVerificationToken();
    await user.save();

    // -------------------------------
    // 5. SEND EMAIL VERIFICATION
    // -------------------------------
    const verifyURL = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${rawToken}&email=${email}`;

    const template = emailVerificationEmail({
      name,
      verificationLink: verifyURL,
    });

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    // -------------------------------
    // 6. SUCCESS RESPONSE
    // -------------------------------
    return successResponse("Signup successful! Verify your email.", {
      userId: user._id,
      email,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
