// =======================================================
// /api/affiliate/[affiliatecode]/link/route.ts
// =======================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Affiliate } from "@/components/server/models/Affiliate.model";
import { Link } from "@/components/server/models/Link.model";
import { Product } from "@/components/server/models/Product.model";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { parseUser } from "@/components/server/middleware/parseUser";
import { rateLimit } from "@/components/server/middleware/rateLimit";

export async function GET(
  req: NextRequest,
  { params }: { params: { affiliatecode: string } }
) {
  await dbConnect();
  await rateLimit(req);

  const { affiliatecode } = params;

  try {
    const affiliate = await Affiliate.findOne({ affiliateCode: affiliatecode });

    if (!affiliate) return errorResponse("Affiliate not found", 404);

    const links = await Link.find({ affiliate: affiliate._id })
      .populate("product", "name slug images basePrice commissionPercent")
      .lean();

    return successResponse("All links fetched", links);
  } catch (error) {
    return errorResponse("Server error", 500);
  }
}

// -------------------------------------------------------
// CREATE LINK (POST)
// -------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: { affiliatecode: string } }
) {
  await dbConnect();
  await rateLimit(req);

  const admin = await checkAdmin(req);
  const user = await parseUser(req);

  if (!admin && !user) return errorResponse("Unauthorized", 401);

  const { affiliatecode } = params;

  try {
    const body = await req.json();
    const { productId, commissionPercent, tag } = body;

    if (!productId) return errorResponse("productId is required", 400);

    const affiliate = await Affiliate.findOne({ affiliateCode: affiliatecode });
    if (!affiliate) return errorResponse("Affiliate not found", 404);

    const product = await Product.findById(productId);
    if (!product) return errorResponse("Product not found", 404);

    const slug = await Link.generateSlug(product.name, affiliate.affiliateCode);

    const newLink = await Link.create({
      affiliate: affiliate._id,
      product: product._id,
      slug,
      commissionPercent: commissionPercent ?? product.commissionPercent ?? 0,
      tag,
    });

    return successResponse("Affiliate link created", newLink, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create link", 500);
  }
}
