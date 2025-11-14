// ===================================================
// src/app/api/tag/[slug]/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Tag } from "@/components/server/models/Tag.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { requireAdmin } from "@/components/server/middleware/checkAdmin";

interface Params {
  slug: string;
}

// ---------------------------------------------------
// GET — PUBLIC: Tag by slug
// ---------------------------------------------------

export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  await dbConnect();
  const { slug } = context.params;

  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) return errorResponse("Tag not found", 404);

  return successResponse("Tag fetched successfully", tag);
}

// ---------------------------------------------------
// PUT — ADMIN: Update Tag (name only)
// ---------------------------------------------------

export async function PUT(
  request: NextRequest,
  context: { params: Params }
) {
  await dbConnect();
  const admin = await requireAdmin(request);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;
  const body = await request.json();

  if (!body.name) {
    return errorResponse("Name is required", 400);
  }

  const updated = await Tag.findOneAndUpdate(
    { slug },
    { name: body.name },
    { new: true }
  );

  if (!updated) return errorResponse("Tag not found", 404);

  return successResponse("Tag updated successfully", updated);
}

// ---------------------------------------------------
// DELETE — ADMIN: Delete Tag
// ---------------------------------------------------

export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  await dbConnect();
  const admin = await requireAdmin(request);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;

  const deleted = await Tag.findOneAndDelete({ slug });
  if (!deleted) return errorResponse("Tag not found", 404);

  return successResponse("Tag deleted successfully");
}
