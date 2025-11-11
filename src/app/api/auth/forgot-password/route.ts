import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/components/server/config/dbConnect';
import { User } from '@/components/server/models/User.model';
import { successResponse, errorResponse } from '@/components/server/lib/apiResponse';
import { sendEmail } from '@/components/server/lib/emailService';
import { passwordResetEmail } from '@/components/server/templates/EmailTemplates';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      // নিরাপত্তার জন্য বলবেন না যে ইউজার পাওয়া যায়নি
      return successResponse({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // পাসওয়ার্ড রিসেট টোকেন জেনারেট করুন এবং সেভ করুন
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // ইমেল পাঠান
    await sendEmail({
      to: email,
      ...passwordResetEmail({ name: user.name, resetLink }),
    });

    return successResponse({ message: 'Password reset link sent to your email.' });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}