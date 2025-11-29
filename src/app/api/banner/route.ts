import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Banner } from "@/components/server/models/Bannar.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { upload } from "@/components/server/config/multerCloudinary";

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
  } catch (err: any) {
    return errorResponse(err.message);
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

    const uploadResult: any = await new Promise((resolve, reject) => {
      upload.storage._handleFile(
        { file: buffer } as any,
        {} as any,
        (err: any, info: any) => {
          if (err) reject(err);
          else resolve(info);
        }
      );
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
  } catch (err: any) {
    console.log("BANNER CREATE ERROR:", err);
    return errorResponse(err.message);
  }
}
