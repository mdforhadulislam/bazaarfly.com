import { NextRequest } from "next/server";
import crypto from "crypto";
import dbConnect from "@/components/server/config/dbConnect";
import { User } from "@/components/server/models/User.model";
import { successResponse, errorResponse } from "@/components/server/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { token } = await request.json();

    if (!token) {
      return errorResponse("Verification token is required.");
    }

    // 🔐 Hash the token before lookup
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // ✅ Find user with valid (non-expired) token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse("Token is invalid or has expired.");
    }

    // ✅ Mark as verified and clear token fields
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return successResponse({
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
