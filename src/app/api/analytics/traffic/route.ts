import dbConnect from "@/components/server/config/dbConnect";
import { Analytics } from "@/components/server/models/Analytics.model";
import { requireAdmin } from "@/components/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await requireAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const traffic = await Analytics.find()
      .sort({ date: -1 })
      .limit(30)
      .select("date totalVisitors newVisitors returningVisitors devices platforms")
      .lean();

    return successResponse("Traffic analytics", traffic);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
