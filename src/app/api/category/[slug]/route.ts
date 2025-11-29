// ===================================================
// CATEGORY — GET | UPDATE | DELETE | UPLOAD (PATCH)
// Single Category by Slug
// ===================================================

import { cloudinaryConfig } from "@/components/server/config/cloudinary";
import dbConnect from "@/components/server/config/dbConnect";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { Category } from "@/components/server/models/Category.model";
import {
  errorResponse,
  successResponse,
} from "@/components/server/utils/response";
import { NextRequest } from "next/server";

const cloudinary = cloudinaryConfig();

// -----------------------------------------
// PARAM TYPE
// -----------------------------------------
interface Params {
  slug: string;
}

// ===================================================
// GET — PUBLIC
// ===================================================
export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { slug } = context.params;

  const category = await Category.findOne({ slug });
  if (!category) return errorResponse("Category not found", 404);

  return successResponse("Category fetched", category);
}

// ===================================================
// PUT — ADMIN UPDATE WHOLE CATEGORY
// ===================================================
export async function PUT(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;
  const updates = await req.json();

  // Auto slug update if name changed
  if (updates.name) {
    updates.slug = await Category.generateSlug(updates.name);
  }

  const updated = await Category.findOneAndUpdate({ slug }, updates, {
    new: true,
  });

  if (!updated) return errorResponse("Category not found", 404);

  return successResponse("Category updated", updated);
}

// ===================================================
// PATCH — ADMIN (Upload image | icon | banner)
// /api/category/[slug]?type=image
// ===================================================
export async function PATCH(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;
  const type = req.nextUrl.searchParams.get("type") || "image";

  if (!["image", "icon", "banner"].includes(type)) {
    return errorResponse("Invalid type parameter", 400);
  }

  // Read File
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return errorResponse("Image file missing", 400);

  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "bazaarfly/category" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });

  const url = (uploadResult as any).secure_url;

  // Update category field (image/icon/banner)
  const updated = await Category.findOneAndUpdate(
    { slug },
    { [type]: url },
    { new: true }
  );

  if (!updated) return errorResponse("Category not found", 404);

  return successResponse(`Category ${type} updated`, updated);
}

// ===================================================
// DELETE — ADMIN DELETE CATEGORY
// ===================================================
export async function DELETE(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;

  const deleted = await Category.findOneAndDelete({ slug });

  if (!deleted) return errorResponse("Category not found", 404);

  return successResponse("Category deleted");
}
