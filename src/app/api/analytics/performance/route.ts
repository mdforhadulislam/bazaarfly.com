import dbConnect from "@/components/server/config/dbConnect";
import { Analytics } from "@/components/server/models/Analytics.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/components/server/utils/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const last30 = await Analytics.find()
      .sort({ date: -1 })
      .limit(30)
      .lean();

    return successResponse("Performance analytics", last30);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
