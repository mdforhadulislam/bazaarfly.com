import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Popup } from "@/components/server/models/popup.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
} from "@/components/server/utils/response";

import { cloudinaryConfig } from "@/components/server/config/cloudinary";

const cloudinary = cloudinaryConfig();

// --------------------------------------------------
// ADMIN — GET SINGLE POPUP
// --------------------------------------------------
export async function GET(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const popup = await Popup.findById(params.id);

    if (!popup) return errorResponse("Popup not found", 404);

    return successResponse("Popup fetched", popup);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// --------------------------------------------------
// ADMIN — UPDATE POPUP
// --------------------------------------------------
export async function PUT(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const data = await req.json();

    const updated = await Popup.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!updated) return errorResponse("Popup not found", 404);

    return successResponse("Popup updated", updated);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// --------------------------------------------------
// ADMIN — UPDATE ONLY IMAGE
// --------------------------------------------------
export async function PATCH(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) return errorResponse("Image is required", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "bazaarfly/popup" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });

    const imageUrl = (uploadResult as any).secure_url;

    const updated = await Popup.findByIdAndUpdate(
      params.id,
      { image: imageUrl },
      { new: true }
    );

    if (!updated) return errorResponse("Popup not found", 404);

    return successResponse("Popup image updated", updated);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// --------------------------------------------------
// ADMIN — DELETE POPUP
// --------------------------------------------------
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const deleted = await Popup.findByIdAndDelete(params.id);

    if (!deleted) return errorResponse("Popup not found", 404);

    return successResponse("Popup deleted");
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
