import { NextRequest } from 'next/server';
import dbConnect from '@/components/server/config/dbConnect';
import { User } from '@/components/server/models/User.model';
import { successResponse, errorResponse } from '@/components/server/lib/apiResponse';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// --- Constants for Security ---
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { identifier, password } = await request.json();

    // 1. Basic Input Validation
    if (!identifier || !password) {
      return errorResponse('Email/Phone number and password are required.', 400);
    }

    // 2. Find user and explicitly select password and security fields
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    })
      .select('+password +loginAttempts +lockUntil +refreshToken') // Select fields needed for security
      .exec();

    // 3. Handle non-existent user
    if (!user) {
      // Use a generic error message to prevent user enumeration attacks
      return errorResponse('Invalid credentials.', 401);
    }

    // 4. Handle locked account
    if (user.isLocked) {
      return errorResponse('Account is temporarily locked due to too many failed login attempts. Please try again later.', 423);
    }

    // 5. Compare password
    const isMatch = await user.comparePassword(password);

    // 6. Handle incorrect password
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock the account if max attempts is reached
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS && !user.isLocked) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
      }
      
      await user.save();
      return errorResponse('Invalid credentials.', 401);
    }

    // 7. Check if email is verified
    if (!user.isEmailVerified) {
      return errorResponse('Please verify your email before signing in.', 403);
    }

    // --- AT THIS POINT, LOGIN IS SUCCESSFUL ---

    // 8. Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // 9. Update last login info
    user.lastLogin = new Date();
    // Get IP address, considering proxies
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip;
    user.lastLoginIP = ip;

    // 10. Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');
    user.refreshToken = refreshToken;

    // 11. Save user with new session info
    await user.save();

    // 12. Prepare response and set cookies
    const response = successResponse({
      message: 'Signin successful',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

    // Set Access Token Cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Set Refresh Token Cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Signin Error:', error);
    return errorResponse(error.message || 'An internal server error occurred.', 500);
  }
}