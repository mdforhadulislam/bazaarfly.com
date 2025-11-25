// =======================================================
// /api/affiliate/[affiliatecode]/link/[id]/route.ts
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
  { params }: { params: { affiliatecode: string; id: string } }
) {
  await dbConnect();
  await rateLimit(req);

  const { affiliatecode, id } = params;

  try {
    const affiliate = await Affiliate.findOne({ affiliateCode: affiliatecode });

    if (!affiliate) return errorResponse("Affiliate not found", 404);

    const link = await Link.findOne({ _id: id, affiliate: affiliate._id })
      .populate("product", "name slug images basePrice commissionPercent")
      .lean();

    if (!link) return errorResponse("Link not found", 404);

    return successResponse("Link details", link);
  } catch (error) {
    return errorResponse("Server error", 500);
  }
}

// -------------------------------------------------------
// UPDATE LINK (PATCH)
// -------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: { affiliatecode: string; id: string } }
) {
  await dbConnect();
  await rateLimit(req);

  const admin = await checkAdmin(req);
  const user = await parseUser(req);

  if (!admin && !user) return errorResponse("Unauthorized", 401);

  const { affiliatecode, id } = params;

  try {
    const affiliate = await Affiliate.findOne({ affiliateCode: affiliatecode });
    if (!affiliate) return errorResponse("Affiliate not found", 404);

    const body = await req.json();
    const updateData: any = {};

    if (body.commissionPercent !== undefined)
      updateData.commissionPercent = body.commissionPercent;

    if (body.tag !== undefined) updateData.tag = body.tag;

    if (body.productId) {
      const product = await Product.findById(body.productId);
      if (!product) return errorResponse("Product not found", 404);

      updateData.product = product._id;

      // regenerate slug
      updateData.slug = await Link.generateSlug(product.name, affiliate.affiliateCode);
    }

    const updatedLink = await Link.findOneAndUpdate(
      { _id: id, affiliate: affiliate._id },
      updateData,
      { new: true }
    );

    if (!updatedLink) return errorResponse("Link not found", 404);

    return successResponse("Link updated successfully", updatedLink);
  } catch (error) {
    return errorResponse("Update failed", 500);
  }
}

// -------------------------------------------------------
// DELETE LINK
// -------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: { affiliatecode: string; id: string } }
) {
  await dbConnect();
  await rateLimit(req);

  const admin = await requireAdmin(req);
  if (!admin) return errorResponse("Admin only", 403);

  const { affiliatecode, id } = params;

  try {
    const affiliate = await Affiliate.findOne({ affiliateCode: affiliatecode });
    if (!affiliate) return errorResponse("Affiliate not found", 404);

    const deleted = await Link.findOneAndDelete({
      _id: id,
      affiliate: affiliate._id,
    });

    if (!deleted) return errorResponse("Link not found", 404);

    return successResponse("Link deleted successfully", deleted);
  } catch (error) {
    return errorResponse("Failed to delete link", 500);
  }
}
