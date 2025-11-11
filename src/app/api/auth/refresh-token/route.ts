import { NextRequest } from 'next/server';
import dbConnect from '@/components/server/config/dbConnect';
import { User } from '@/components/server/models/User.model';
import { successResponse, errorResponse } from '@/components/server/lib/apiResponse';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// --- BEST PRACTICE: Fail fast if critical env vars are missing ---
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Get the refresh token from the HTTP-only cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      // No refresh token, the user must log in again
      const response = errorResponse('Refresh token not found. Please sign in.', 401);
      response.cookies.delete('accessToken'); // Clean up any old tokens
      response.cookies.delete('refreshToken');
      return response;
    }

    // 2. Find the user associated with this refresh token
    // We explicitly select the refreshToken field since it has `select: false` in the schema
    const user = await User.findOne({ refreshToken }).select('+refreshToken').exec();

    if (!user) {
      // The refresh token is invalid (doesn't belong to any user or was tampered with)
      // Clear the invalid cookie from the client
      const response = errorResponse('Invalid refresh token. Please sign in.', 401);
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    // --- At this point, the refresh token is valid ---

    // 3. Generate a new access token
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );

    // 4. IMPORTANT: Refresh Token Rotation
    // For better security, generate a NEW refresh token and invalidate the old one.
    // This prevents an attacker from reusing a stolen refresh token.
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    user.refreshToken = newRefreshToken;
    await user.save();

    // 5. Set the new tokens in HTTP-only cookies
    const response = successResponse({ message: 'Token refreshed successfully.' });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Refresh Token Error:', error);
    // In case of a server error, also clear cookies to be safe
    const response = errorResponse('Failed to refresh token. Please sign in again.', 500);
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }
}