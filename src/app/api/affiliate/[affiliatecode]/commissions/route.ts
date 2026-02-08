// Admin: list commissions (paginated + filter)
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
    const { page = "1", limit = "20", affiliateId, from, to } = params;
    const pageNum = Number(page),
      limitNum = Number(limit),
      skip = (pageNum - 1) * limitNum;

    const q: {
      affiliate?: string;
      createdAt?: { $gte?: Date; $lte?: Date };
      affiliateCommission: { $gt: number };
    } = {
      affiliateCommission: { $gt: 0 },
    };
    if (affiliateId) q.affiliate = affiliateId;
    if (from || to) q.createdAt = {};
    if (from) {
      if (!q.createdAt) q.createdAt = {};
      q.createdAt.$gte = new Date(from);
    }
    if (to) {
      if (!q.createdAt) q.createdAt = {};
      q.createdAt.$lte = new Date(to);
    }

    // Commissions are stored in Order. We'll return orders having affiliateCommission > 0

    const [orders, total] = await Promise.all([
      Order.find(q).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(q),
    ]);

    return successResponse("Commissions fetched", {
      commissions: orders,
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
    console.error("AFFILIATE COMMISSIONS LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
