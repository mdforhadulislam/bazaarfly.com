import dbConnect from "@/components/server/config/dbConnect";
import {
  errorResponse,
  successResponse,
} from "@/components/server/lib/apiResponse";
import { User } from "@/components/server/models/User.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return errorResponse('Reset token and new password are required.', 400);
    }

    // Hash the incoming token to match the one in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by the hashed token and ensure it hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return errorResponse('Token is invalid or has expired.', 400);
    }

    // Use the instance method to set the new password
    // This method hashes the password and clears the reset token fields
    await user.setNewPassword(newPassword);

    return successResponse({ message: 'Password has been reset successfully. You can now sign in with your new password.' });

  } catch (error: any) {
    console.error('Password Reset Confirmation Error:', error);
    return errorResponse(error.message || 'An internal server error occurred.', 500);
  }
}
