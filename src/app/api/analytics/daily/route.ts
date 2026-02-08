import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Analytics } from "@/server/models/Analytics.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/server/utils/response";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const date = req.nextUrl.searchParams.get("date");
    const targetDate = date ? new Date(date) : new Date();

    const analytics = await Analytics.getOrCreate(targetDate);
    return successResponse("Daily analytics", analytics);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
