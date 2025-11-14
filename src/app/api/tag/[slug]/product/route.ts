// ===================================================
// src/app/api/tag/[slug]/product/route.ts
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Tag } from "@/components/server/models/Tag.model";
import { Product } from "@/components/server/models/Product.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";

interface Params {
  slug: string;
}

// ---------------------------------------------------
// GET — PUBLIC: Products filtered by Tag
// ---------------------------------------------------

export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  await dbConnect();

  const { slug } = context.params;

  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) return errorResponse("Tag not found", 404);

  const products = await Product.find({
    tags: tag._id,
  })
    .select("name slug images price stock createdAt")
    .lean();

  return successResponse("Products fetched successfully", products);
}
