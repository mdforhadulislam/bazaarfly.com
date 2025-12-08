// Admin: list conversions (affiliate link conversions)
import dbConnect from "@/components/server/config/dbConnect";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { Order } from "@/components/server/models/Order.model";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/components/server/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { page = "1", limit = "20", linkId, affiliateId, from, to } = params;
    const pageNum = Number(page),
      limitNum = Number(limit),
      skip = (pageNum - 1) * limitNum;

    interface Query {
      link?: string;
      affiliate?: string;
      createdAt?: { $gte?: Date; $lte?: Date };
    }
    const q: Query = {};
    if (linkId) q.link = linkId;
    if (affiliateId) q.affiliate = affiliateId;
    if (from || to) q.createdAt = {};
    if (from) q.createdAt!.$gte = new Date(from);
    if (to) q.createdAt!.$lte = new Date(to);

    // conversions are represented by orders with a link or affiliate
    const [orders, total] = await Promise.all([
      Order.find({ ...q, link: { $exists: true, $ne: null } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ ...q, link: { $exists: true, $ne: null } }),
    ]);

    return successResponse("Conversions fetched", {
      conversions: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: skip + orders.length < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("AFFILIATE CONVERSIONS LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
