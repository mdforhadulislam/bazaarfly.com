// Admin: list commissions (paginated + filter)
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Order } from "@/components/server/models/Order.model";
import { Affiliate } from "@/components/server/models/Affiliate.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/components/server/utils/response";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { page = "1", limit = "20", affiliateId, from, to } = params;
    const pageNum = Number(page), limitNum = Number(limit), skip = (pageNum - 1) * limitNum;

    const q: any = {};
    if (affiliateId) q.affiliate = affiliateId;
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);

    // Commissions are stored in Order. We'll return orders having affiliateCommission > 0
    q.affiliateCommission = { $gt: 0 };

    const [orders, total] = await Promise.all([
      Order.find(q).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(q),
    ]);

    return successResponse("Commissions fetched", {
      commissions: orders,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), hasNextPage: skip + orders.length < total, hasPrevPage: pageNum > 1 },
    });
  } catch (err) {
    console.error("AFFILIATE COMMISSIONS LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
