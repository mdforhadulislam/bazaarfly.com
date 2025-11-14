// ===================================================
// src/app/api/category/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Category } from "@/components/server/models/Category.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { requireAdmin } from "@/components/server/middleware/checkAdmin";

// ---------------------------------------------------
// PUBLIC — GET ALL CATEGORIES
// ---------------------------------------------------

export async function GET() {
  await dbConnect();

  const categories = await Category.find()
    .sort({ priority: -1 })
    .lean();

  return successResponse("Categories fetched successfully", categories);
}

// ---------------------------------------------------
// ADMIN — CREATE CATEGORY
// ---------------------------------------------------

export async function POST(req: NextRequest) {
  await dbConnect();

  const admin = await requireAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const body = await req.json();
  const { name, parent, priority } = body;

  if (!name) return errorResponse("Name is required", 400);

  const slug = await Category.generateSlug(name);

  const category = await Category.create({
    name,
    slug,
    parent: parent || null,
    priority: priority || 1,
  });

  return successResponse("Category created successfully", category, 201);
}
