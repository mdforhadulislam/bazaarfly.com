// Admin: list wallets (pagination) + system totals
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Wallet } from "@/components/server/models/Wallet.model";
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
    const { page = "1", limit = "20", q } = params;
    const pageNum = Number(page), limitNum = Number(limit), skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (q) filter.$or = [{ affiliate: q }];

    const [wallets, total] = await Promise.all([
      Wallet.find(filter).sort({ totalEarnings: -1 }).skip(skip).limit(limitNum).lean(),
      Wallet.countDocuments(filter),
    ]);

    const totals = await Wallet.aggregate([
      { $group: { _id: null, totalAvailable: { $sum: "$availableBalance" }, totalHeld: { $sum: "$heldBalance" }, totalEarnings: { $sum: "$totalEarnings" } } },
    ]);

    return successResponse("Wallets fetched", { wallets, totals: totals[0] || {}, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error("AFFILIATE WALLETS LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
