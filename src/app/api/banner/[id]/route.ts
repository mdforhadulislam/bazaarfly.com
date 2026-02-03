import { cloudinaryConfig } from "@/server/config/cloudinary";
import dbConnect from "@/server/config/dbConnect";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { Banner } from "@/server/models/Bannar.model";
import { errorResponse, successResponse } from "@/server/utils/response";
import { NextRequest } from "next/server";

const cloudinary = cloudinaryConfig();

interface RouteParams {
  params: {
    id: string;
  };
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

// -----------------------------------------
// GET — Admin only (fetch single banner)
// -----------------------------------------
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const banner = await Banner.findById(params.id);
    if (!banner) return errorResponse("Banner not found", 404);

    return successResponse("Banner retrieved", banner);
  } catch (err: unknown) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}

// -----------------------------------------
// PUT — Admin update details (no image)
// -----------------------------------------
export async function PUT(req: NextRequest, { params }: RouteParams) {
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
  } catch (err: unknown) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}

// -----------------------------------------
// PATCH — Update image only
// -----------------------------------------
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);

    if (!admin) return errorResponse("Unauthorized", 401);

    const form = await req.formData();
    const file = form.get("image") as File;

    if (!file) return errorResponse("Image file required", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadRes: CloudinaryUploadResponse = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "bazaarfly/banner" }, (err, img) => {
            if (err) reject(err);
            else if (img) resolve(img);
            else
              reject(new Error("Upload failed: no response from Cloudinary"));
          })
          .end(buffer);
      }
    );

    const updated = await Banner.findByIdAndUpdate(
      params.id,
      { image: uploadRes.secure_url },
      { new: true }
    );

    if (!updated) return errorResponse("Banner not found", 404);

    return successResponse("Banner image updated", updated);
  } catch (err: unknown) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}

// -----------------------------------------
// DELETE — Admin remove banner
// -----------------------------------------
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const deleted = await Banner.findByIdAndDelete(params.id);
    if (!deleted) return errorResponse("Banner not found", 404);

    return successResponse("Banner deleted");
  } catch (err: unknown) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
