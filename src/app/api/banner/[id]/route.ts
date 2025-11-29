import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Banner } from "@/components/server/models/Bannar.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { cloudinaryConfig } from "@/components/server/config/cloudinary";

const cloudinary = cloudinaryConfig();

// -----------------------------------------
// GET — Admin only (fetch single banner)
// -----------------------------------------
export async function GET(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const banner = await Banner.findById(params.id);
    if (!banner) return errorResponse("Banner not found", 404);

    return successResponse("Banner retrieved", banner);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// -----------------------------------------
// PUT — Admin update details (no image)
// -----------------------------------------
export async function PUT(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);

    if (!admin) return errorResponse("Unauthorized", 401);

    const updates = await req.json();
    const banner = await Banner.findByIdAndUpdate(params.id, updates, {
      new: true,
    });

    if (!banner) return errorResponse("Banner not found", 404);

    return successResponse("Banner updated", banner);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// -----------------------------------------
// PATCH — Update image only
// -----------------------------------------
export async function PATCH(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);

    if (!admin) return errorResponse("Unauthorized", 401);

    const form = await req.formData();
    const file = form.get("image") as File;

    if (!file) return errorResponse("Image file required", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadRes: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "bazaarfly/banner" }, (err, img) => {
          if (err) reject(err);
          else resolve(img);
        })
        .end(buffer);
    });

    const updated = await Banner.findByIdAndUpdate(
      params.id,
      { image: uploadRes.secure_url },
      { new: true }
    );

    if (!updated) return errorResponse("Banner not found", 404);

    return successResponse("Banner image updated", updated);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// -----------------------------------------
// DELETE — Admin remove banner
// -----------------------------------------
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const deleted = await Banner.findByIdAndDelete(params.id);
    if (!deleted) return errorResponse("Banner not found", 404);

    return successResponse("Banner deleted");
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
