import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { successResponse, errorResponse } from "@/server/utils/response";
import { checkAdmin } from "@/server/middleware/checkAdmin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const folder = body?.folder || "bazaarfly/products";

    const timestamp = Math.floor(Date.now() / 1000);

    // you can also add more params like "eager", "transformation" etc
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return successResponse("Signature generated", {
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (e) {
    console.error("CLOUDINARY SIGN ERROR:", e);
    return errorResponse("Internal Server Error", 500);
  }
}
