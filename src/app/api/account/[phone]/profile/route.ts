import { NextRequest } from "next/server";
import formidable from "formidable";
import fs from "fs";
import dbConnect from "@/components/server/config/dbConnect";
import { User } from "@/components/server/models/User.model";
import { parseUser } from "@/components/server/middleware/parseUser";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { cloudinaryConfig } from "@/components/server/config/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/components/server/utils/response";

// allow formidable to parse body
export const config = { api: { bodyParser: false } };

cloudinaryConfig();

async function parseForm(req: NextRequest) {
  const form = new formidable.IncomingForm();
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
   
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone) return errorResponse("Phone parameter required", 400);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);

    // allow admin or owner
    if (!admin && (!requester || requester.phoneNumber !== phone)) {
      return unauthorizedResponse();
    }

    const user = await User.findOne({ phoneNumber: phone }).lean();
    if (!user) return errorResponse("User not found", 404);

    return successResponse("Profile fetched", {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar || "/mnt/data/bdf7e724-a1ab-4b68-afe9-b08156b727a5.png",
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

export async function PUT(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone) return errorResponse("Phone parameter required", 400);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);

    // allow admin or owner
    if (!admin && (!requester || requester.phoneNumber !== phone)) {
      return unauthorizedResponse();
    }

    // expect JSON update
    const body = await req.json();
    const allowed = ["name", "email", "gender", "dateOfBirth", "preferences", "notes", "avatar"];
    const updates: any = {};
    for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];

    const updated = await User.findOneAndUpdate({ phoneNumber: phone }, updates, { new: true }).lean();
    if (!updated) return errorResponse("User not found", 404);
    return successResponse("Profile updated", updated);
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// Avatar upload via multipart/form-data
export async function POST(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    if (!phone) return errorResponse("Phone parameter required", 400);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);

    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    // parse multipart
    const { fields, files } = await parseForm(req);
    const avatarFile = (files.avatar || files.file) as any;
    if (!avatarFile) return validationErrorResponse({ avatar: "avatar file is required" } as Record<string, string>);

    const filePath = avatarFile.path || avatarFile.filepath || avatarFile.file;
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn("Uploaded file not found on disk, returning error.");
      return errorResponse("File upload failed", 500);
    }

    // upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      folder: "bazaarfly/profile_avatars",
      resource_type: "image",
      overwrite: true,
      use_filename: true,
    });

    // delete tmp file
    try { fs.unlinkSync(filePath); } catch (e) {}

    const user = await User.findOneAndUpdate(
      { phoneNumber: phone },
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
