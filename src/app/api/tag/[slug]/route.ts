import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Tag } from "@/server/models/Tag.model";
import { successResponse, errorResponse } from "@/server/utils/response";
import { checkAdmin } from "@/server/middleware/checkAdmin";

function slugifyLite(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Params {
  slug: string;
}

// GET — PUBLIC
export async function GET(_req: NextRequest, context: { params: Params }) {
  await dbConnect();
  const { slug } = context.params;

  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) return errorResponse("Tag not found", 404);

  return successResponse("Tag fetched successfully", tag);
}

// PUT — ADMIN (name/slug/isActive)
export async function PUT(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug: currentSlug } = context.params;
  const body = await req.json();

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const isActive =
    typeof body?.isActive === "boolean" ? body.isActive : undefined;

  if (!name) return errorResponse("Name is required", 400);

  const incomingSlugRaw = typeof body?.slug === "string" ? body.slug.trim() : "";
  const nextSlug = (incomingSlugRaw ? incomingSlugRaw : slugifyLite(name)).toLowerCase();

  // if slug changing, check conflict
  if (nextSlug !== currentSlug) {
    const conflict = await Tag.findOne({ slug: nextSlug }).lean();
    if (conflict) return errorResponse("This slug already exists", 409);
  }

  const updated = await Tag.findOneAndUpdate(
    { slug: currentSlug },
    { name, slug: nextSlug, ...(isActive !== undefined ? { isActive } : {}) },
    { new: true }
  );

  if (!updated) return errorResponse("Tag not found", 404);

  return successResponse("Tag updated successfully", updated);
}

// DELETE — ADMIN
export async function DELETE(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { slug } = context.params;

  const deleted = await Tag.findOneAndDelete({ slug });
  if (!deleted) return errorResponse("Tag not found", 404);

  return successResponse("Tag deleted successfully");
}
