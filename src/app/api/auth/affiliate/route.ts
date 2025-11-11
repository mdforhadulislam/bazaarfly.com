import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/components/server/config/dbConnect';
import { User } from '@/components/server/models/User.model';
import { AffiliateApplication } from '@/components/server/models/AffiliateApplication.model';
import { successResponse, errorResponse } from '@/components/server/lib/apiResponse';
import { sendEmail } from '@/components/server/lib/emailService';
import { affiliateApplicationReceived, newAffiliateApplicationEmail } from '@/components/server/templates/EmailTemplates';
import jwt from 'jsonwebtoken';
 
const getUserFromToken = async (request: NextRequest) => {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        await dbConnect();
        return await User.findById(decoded.id).select('-password');
    } catch (error) {
        return null;
    }
};
 
export async function POST(request: NextRequest) {
  try { 
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized. Please sign in to apply.', 401);
    }
    if (user.role === 'affiliate') {
      return errorResponse('You are already an affiliate.', 400);
    }
    await dbConnect();
     
    const existingApplication = await AffiliateApplication.findOne({ user: user._id });
    if (existingApplication) {
      return errorResponse('You have already submitted an application. Please wait for admin approval.', 400);
    }

    const { message } = await request.json();
    
    // নতুন আবেদন তৈরি করুন
    const application = new AffiliateApplication({ 
        user: user._id, 
        message: message || 'I would like to join the affiliate program.' 
    });
    await application.save();

    // ইউজারকে নিশ্চিতকরণ ইমেল পাঠান
    await sendEmail({
        to: user.email,
        ...affiliateApplicationReceived({ name: user.name }),
    });

    // অ্যাডমিনকে নতুন আবেদনের ইমেল পাঠান
    // অ্যাডমিনের ইমেল একটি env ভেরিয়েবল থেকে নিন
    if (process.env.ADMIN_EMAIL) {
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            ...newAffiliateApplicationEmail({ 
                name: user.name, 
                email: user.email, 
                applicationId: application.applicationId 
            }),
        });
    }

    return successResponse({ 
        message: 'Your application has been submitted successfully! We will notify you once it is reviewed.' 
    }, 201);

  } catch (error: any) {
    console.log(error);
    
    console.error('Affiliate Application Error:', error);
    return errorResponse(error.message, 500);
  }
}