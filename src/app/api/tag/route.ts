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

// GET — PUBLIC: Fetch all tags
export async function GET() {
  await dbConnect();
  const tags = await Tag.find().sort({ createdAt: -1 }).lean();
  return successResponse("Tags fetched successfully", tags);
}

// POST — ADMIN: Create Tag
export async function POST(req: NextRequest) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const body = await req.json();
  const name = (body?.name ?? "").trim();
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;
  const rawSlug = (body?.slug ?? "").trim();

  if (!name) return errorResponse("Tag name is required", 400);

  let slug = (rawSlug ? rawSlug : slugifyLite(name)).toLowerCase();

  // Unique slug ensure (basic)
  const exists = await Tag.findOne({ slug }).lean();
  if (exists) return errorResponse("This slug already exists", 409);

  const tag = await Tag.create({ name, slug, isActive });
  return successResponse("Tag created successfully", tag, 201);
}
