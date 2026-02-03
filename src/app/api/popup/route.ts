import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Popup } from "@/server/models/popup.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/server/utils/response";

import { cloudinaryConfig } from "@/server/config/cloudinary";

const cloudinary = cloudinaryConfig();

// --------------------------------------------------
// PUBLIC — GET ACTIVE POPUPS
// --------------------------------------------------
export async function GET() {
  try {
    await dbConnect();

    const now = new Date();

    const popups = await Popup.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
      ],
    }).sort({ createdAt: -1 });

    return successResponse("Active popups", popups);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// --------------------------------------------------
// ADMIN — CREATE POPUP
// --------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const form = await req.formData();

    const title = form.get("title") as string;
    const content = form.get("content") as string;
    const type = form.get("type") as string;
    const trigger = form.get("trigger") as string;
    const triggerValue = form.get("triggerValue")
      ? Number(form.get("triggerValue"))
      : undefined;

    const startDate = form.get("startDate")
      ? new Date(form.get("startDate") as string)
      : undefined;

    const endDate = form.get("endDate")
      ? new Date(form.get("endDate") as string)
      : undefined;

    if (!title || !content || !trigger || !type) {
      return validationErrorResponse(
        { title: "Required", content: "Required", trigger: "Required", type: "Required" },
        "Missing required fields"
      );
    }

    // OPTIONAL IMAGE UPLOAD
    let imageUrl = undefined;
    const file = form.get("image") as File | null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "bazaarfly/popup" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = (uploadResult as any).secure_url;
    }

    const popup = await Popup.create({
      title,
      content,
      type,
      trigger,
      triggerValue,
      startDate,
      endDate,
      image: imageUrl,
    });

    return successResponse("Popup created", popup, 201);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
