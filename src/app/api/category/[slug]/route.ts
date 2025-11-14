// ===================================================
// src/app/api/category/[slug]/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Category } from "@/components/server/models/Category.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { requireAdmin } from "@/components/server/middleware/checkAdmin";
import {cloudinaryConfig} from "@/components/server/config/cloudinary";

interface Params {
  slug: string;
}

const cloudinary = cloudinaryConfig();

// ---------------------------------------------------
// PUBLIC — GET CATEGORY BY SLUG
// ---------------------------------------------------

export async function GET(
  req: NextRequest,
  context: { params: Params }
) {
  await dbConnect();
  const { slug } = context.params;

  const category = await Category.findOne({ slug }).lean();
  if (!category) return errorResponse("Category not found", 404);

  return successResponse("Category fetched", category);
}

// ---------------------------------------------------
// ADMIN — UPDATE CATEGORY
// ---------------------------------------------------

export async function PUT(
  req: NextRequest,
  context: { params: Params }
) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;
  const updates = await req.json();

  const updated = await Category.findOneAndUpdate({ slug }, updates, {
    new: true,
  });

  if (!updated) return errorResponse("Category not found", 404);

  return successResponse("Category updated", updated);
}

// ---------------------------------------------------
// ADMIN — DELETE CATEGORY
// ---------------------------------------------------

export async function DELETE(
  req: NextRequest,
  context: { params: Params }
) {
  await dbConnect();

  const admin = await requireAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const deleted = await Category.findOneAndDelete({
    slug: context.params.slug,
  });

  if (!deleted) return errorResponse("Category not found", 404);

  return successResponse("Category deleted successfully");
}

// ---------------------------------------------------
// ADMIN — PATCH IMAGE UPLOAD (image | icon | banner)
// ---------------------------------------------------

export async function PATCH(
  req: NextRequest,
  context: { params: Params }
) {
  await dbConnect();

  const admin = await requireAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;
  const type = req.nextUrl.searchParams.get("type") || "image";

  if (!["image", "icon", "banner"].includes(type)) {
    return errorResponse("Invalid type parameter", 400);
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return errorResponse("Image file missing", 400);

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "bazaarfly/category" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  const url = (uploadResult as any).secure_url;

  const updated = await Category.findOneAndUpdate(
    { slug },
    { [type]: url },
    { new: true }
  );

  if (!updated) return errorResponse("Category not found", 404);

  return successResponse("Category " + type + " updated", updated);
}
