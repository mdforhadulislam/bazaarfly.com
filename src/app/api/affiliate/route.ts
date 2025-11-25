// ===================================================================================
// /api/affiliate
// Admin-only: Get all affiliates with filtering, search, pagination
// ===================================================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Affiliate } from "@/components/server/models/Affiliate.model";
import { User } from "@/components/server/models/User.model";
import { Wallet } from "@/components/server/models/Wallet.model";

import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { rateLimit } from "@/components/server/middleware/rateLimit";

import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/components/server/utils/response";

// ===================================================================================
// GET — Admin: List all affiliates
// Query params:
// ?page=1&limit=20
// ?search=forhad
// ?status=active/suspended
// ?sort=earnings
// ===================================================================================

export async function GET(req: NextRequest) {
  await dbConnect();
  await rateLimit(req);

  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin access only", 403);

    // ===========================
    // Query Parameters
    // ===========================
    const { search, status, sort } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    let page = Number(req.nextUrl.searchParams.get("page")) || 1;
    let limit = Number(req.nextUrl.searchParams.get("limit")) || 20;

    const skip = (page - 1) * limit;

    // ===========================
    // Build Query
    // ===========================
    const query: Record<string, any> = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { affiliateCode: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    // ===========================
    // Sorting Logic
    // ===========================
    const sortOptions: Record<string, any> = {};

    if (sort === "earnings") sortOptions.totalEarnings = -1;
    else if (sort === "clicks") sortOptions.totalClicks = -1;
    else sortOptions.createdAt = -1;

    // ===========================
    // Fetch Data
    // ===========================

    const total = await Affiliate.countDocuments(query);

    const affiliates = await Affiliate.find(query)
      .populate("user", "name email phoneNumber avatar role")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // ===========================
    // Attach wallet info
    // ===========================
    for (const affiliate of affiliates) {
      const wallet = await Wallet.findByAffiliate(affiliate._id).lean();
      affiliate.wallet = wallet ?? null;
    }

    return paginatedResponse(
      "Affiliates fetched",
      affiliates,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      }
    );
  } catch (err) {
    console.error("AFFILIATE ROOT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
