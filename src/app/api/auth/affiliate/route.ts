// ===================================================
// src/app/api/auth/affiliate/route.ts
// ===================================================

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import dbConnect from "@/components/server/config/dbConnect";
import { User } from "@/components/server/models/User.model";
import { AffiliateApplication } from "@/components/server/models/AffiliateApplication.model";

import { successResponse, errorResponse } from "@/components/server/utils/response";
import { sendEmail } from "@/components/server/lib/emailService";

import {
  affiliateApplicationReceived,
  newAffiliateApplicationEmail,
} from "@/components/server/templates/EmailTemplates";

// ---------------------------------------------------
// Helper: Get user from Access Token
// ---------------------------------------------------

const getUserFromToken = async (
  req: NextRequest
): Promise<InstanceType<typeof User> | null> => {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { userId: string };

    await dbConnect();
    return User.findById(decoded.userId).select("-password");
  } catch {
    return null;
  }
};

// ---------------------------------------------------
// POST — Apply for Affiliate Program
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // ------------------------------------
    // 1. Authenticate User
    // ------------------------------------
    const user = await getUserFromToken(req);
    if (!user) {
      return errorResponse("Unauthorized. Please sign in to apply.", 401);
    }

    if (user.role === "affiliate") {
      return errorResponse("You are already an affiliate.", 400);
    }

    // ------------------------------------
    // 2. Check Existing Application
    // ------------------------------------
    const existingApplication = await AffiliateApplication.findOne({
      user: user._id,
    });

    if (existingApplication) {
      return errorResponse(
        "You have already submitted an application. Please wait for admin approval.",
        400
      );
    }

    // ------------------------------------
    // 3. Read Body
    // ------------------------------------
    const body: { message?: string } = await req.json();

    const message =
      body.message ||
      "I would like to join the Bazaarfly Affiliate Program.";

    // ------------------------------------
    // 4. Create Application
    // ------------------------------------
    const application = await AffiliateApplication.create({
      user: user._id,
      message,
    });

    // ------------------------------------
    // 5. Send Confirmation Email to User
    // ------------------------------------
    const userEmailTemplate = affiliateApplicationReceived({
      name: user.name,
    });

    await sendEmail({
      to: user.email,
      subject: userEmailTemplate.subject,
      html: userEmailTemplate.html,
    });

    // ------------------------------------
    // 6. Send Email to Admin
    // ------------------------------------
    if (process.env.ADMIN_EMAIL) {
      const adminTemplate = newAffiliateApplicationEmail({
        name: user.name,
        email: user.email,
        applicationId: application.applicationId,
      });

      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });
    }

    // ------------------------------------
    // 7. Success Response
    // ------------------------------------
    return successResponse(
      "Your affiliate application has been submitted successfully!",
      application,
      201
    );
  } catch (error) {
    console.error("AFFILIATE APPLY ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
