// ===================================================
// src/app/api/category/[slug]/product/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Category } from "@/components/server/models/Category.model";
import { Product } from "@/components/server/models/Product.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";

interface Params {
  slug: string;
}

// ---------------------------------------------------
// PUBLIC — GET PRODUCTS UNDER CATEGORY
// ---------------------------------------------------

export async function GET(
  req: NextRequest,
  context: { params: Params }
) {
  await dbConnect();

  const { slug } = context.params;

  const category = await Category.findOne({ slug }).lean();
  if (!category) return errorResponse("Category not found", 404);

  const products = await Product.find({
    category: category._id,
    isActive: true,
  })
    .select("name slug images price stock createdAt")
    .lean();

  return successResponse("Products fetched successfully", products);
}
