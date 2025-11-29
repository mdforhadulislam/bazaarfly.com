// ===================================================
// src/app/api/tag/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Tag } from "@/components/server/models/Tag.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";

// ---------------------------------------------------
// GET — PUBLIC: Fetch all tags
// ---------------------------------------------------

export async function GET() {
  await dbConnect();
  const tags = await Tag.find().sort({ createdAt: -1 }).lean();
  return successResponse("Tags fetched successfully", tags);
}

// ---------------------------------------------------
// POST — ADMIN: Create Tag
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const body = await req.json();
  const { name } = body;

  if (!name) {
    return errorResponse("Tag name is required", 400);
  }

  const tag = await Tag.create({ name });

  return successResponse("Tag created successfully", tag, 201);
}
