import dbConnect from "@/server/config/dbConnect";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { Banner } from "@/server/models/Bannar.model";
import { errorResponse, successResponse } from "@/server/utils/response";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest } from "next/server";

interface CloudinaryUploadResult {
  path: string;
  [key: string]: unknown;
}

// We need Next.js file handling
export const runtime = "nodejs";

// --------------------
// GET — Public banners
// --------------------
export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.getActiveBanners();
    return successResponse("Active banners fetched", banners);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return errorResponse(message);
  }
}

// --------------------
// POST — Admin upload
// --------------------
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    // Parse form data
    const form = await req.formData();
    const title = form.get("title") as string;
    const position = form.get("position") as string;
    const file = form.get("image") as File;

    if (!title || !file) return errorResponse("Title & image required", 400);

    // Cloudinary upload
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult: CloudinaryUploadResult =
      await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (err: Error | null, result: CloudinaryUploadResult) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

    const newBanner = await Banner.create({
      title,
      subtitle: form.get("subtitle") || "",
      image: uploadResult.path,
      link: form.get("link") || "",
      position,
      devices: (form.get("devices") as string)?.split(",") || [],
      priority: Number(form.get("priority") || 1),
      isActive: true,
      startDate: new Date(form.get("startDate") as string),
      endDate: new Date(form.get("endDate") as string),
    });

    return successResponse("Banner created", newBanner, 201);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    console.log("BANNER CREATE ERROR:", err);
    return errorResponse(message);
  }
}
