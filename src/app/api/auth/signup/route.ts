import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/components/server/config/dbConnect';
import { User } from '@/components/server/models/User.model';
import { successResponse, errorResponse } from '@/components/server/lib/apiResponse';
import { sendEmail } from '@/components/server/lib/emailService';
import { emailVerificationEmail } from '@/components/server/templates/EmailTemplates';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse and validate input
    const { name, email, password, phoneNumber } = await request.json();
    
    // Basic validation
    if (!name || !email || !password || !phoneNumber) {
      return errorResponse('All fields are required.', 400);
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (existingUser) {
      return errorResponse('User with this email or phone number already exists.', 409);
    }

    // Create user without manually hashing password (the model will handle it)
    const user = new User({ name, email, password, phoneNumber });
    
    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    // Save user (password will be hashed by the pre-save hook)
    await user.save();

    // Create verification link
    const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

    try {
      // Send verification email
      await sendEmail({
        to: email,
        ...emailVerificationEmail({ name, verificationLink }),
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    return successResponse(
      { 
        message: 'User registered successfully. Please check your email to verify your account.',
        userId: user._id
      }, 
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(error.message || 'Registration failed', 500);
  }
}