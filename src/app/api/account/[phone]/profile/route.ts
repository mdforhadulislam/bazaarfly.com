// src/app/api/account/[phone]/profile/route.ts

import dbConnect from "@/server/config/dbConnect";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { parseUser } from "@/server/middleware/parseUser";
import { User } from "@/server/models/User.model";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/server/utils/response";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "@/server/config/cloudinary";
import { NextRequest } from "next/server";


cloudinaryConfig();

/**
 * GET profile
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    await dbConnect();

    const phone = (await params).phone;
    
    if (!phone) return errorResponse("Phone parameter required", 400);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);

    // allow admin or owner
    if (!admin && (!requester || requester.phoneNumber !== phone)) {
      return unauthorizedResponse("Unauthorized");
    }

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();

    if (!user) return errorResponse("User not found", 404);

    return successResponse("Profile fetched", {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar:
        user.avatar ||
        "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png",
      role: user.role,
      preferences: user.preferences,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("PROFILE GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PUT profile (JSON update)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone) return errorResponse("Phone parameter required", 400);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);

    if (!admin && (!requester || requester.phoneNumber !== phone)) {
      return unauthorizedResponse("Unauthorized");
    }

    const body = await req.json();

    const allowed = [
      "name",
      "email",
      "gender",
      "dateOfBirth",
      "preferences",
      "notes",
      "avatar",
    ] as const;

    const updates: any = {};
    for (const k of allowed) {
      if (body?.[k] !== undefined) updates[k] = body[k];
    }

    const updated = await User.findOneAndUpdate(
      { phoneNumber: phone, isDeleted: { $ne: true } },
      updates,
      { new: true }
    ).lean();

    if (!updated) return errorResponse("User not found", 404);

    return successResponse("Profile updated", updated);
  } catch (err: any) {
    console.error("PROFILE UPDATE ERROR:", err);
    if (err?.code === 11000) {
      return errorResponse("Duplicate email/phone", 409);
    }
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * POST avatar upload (multipart/form-data)
 * expects field name: "avatar"
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone) return errorResponse("Phone parameter required", 400);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);

    if (!admin && (!requester || requester.phoneNumber !== phone)) {
      return unauthorizedResponse("Unauthorized");
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return validationErrorResponse({
        avatar: "avatar file is required",
      } as Record<string, string>);
    }

    // Optional: basic mime check
    if (!file.type?.startsWith("image/")) {
      return validationErrorResponse({
        avatar: "Only image files are allowed",
      } as Record<string, string>);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "bazaarfly/profile_avatars",
            resource_type: "image",
            overwrite: true,
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });

    const user = await User.findOneAndUpdate(
      { phoneNumber: phone, isDeleted: { $ne: true } },
      { avatar: uploadRes.secure_url },
      { new: true }
    ).lean();

    if (!user) return errorResponse("User not found", 404);

    return successResponse("Avatar uploaded", { avatar: user.avatar });
  } catch (err) {
    console.error("PROFILE UPLOAD ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
