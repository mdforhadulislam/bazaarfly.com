// Admin: view/list affiliate profiles, update affiliate status
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Affiliate } from "@/components/server/models/Affiliate.model";
import { User } from "@/components/server/models/User.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";
import { Notification, NotificationType } from "@/components/server/models/Notification.model";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { page = "1", limit = "20", q } = params;
    const pageNum = Number(page), limitNum = Number(limit), skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (q) filter.$or = [{ affiliateCode: { $regex: q, $options: "i" } }];

    const [affiliates, total] = await Promise.all([
      Affiliate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Affiliate.countDocuments(filter),
    ]);

    return successResponse("Affiliates fetched", { affiliates, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error("AFFILIATE PROFILE LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PUT update affiliate profile (admin)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const body = await req.json();
    const { affiliateId, updates } = body ?? {};
    if (!affiliateId || !updates) return validationErrorResponse({ affiliateId: "affiliateId required", updates: "updates required" } as any);

    const updated = await Affiliate.findByIdAndUpdate(affiliateId, updates, { new: true }).lean();
    if (!updated) return notFoundResponse("Affiliate not found");

    // notify affiliate user if status changed
    if (updates.status) {
      const aff = await Affiliate.findById(affiliateId).populate("user").lean();
      if (aff && (aff as any).user) {
        await Notification.createNotification({
          recipient: (aff as any).user,
          type: updates.status === "active" ? NotificationType.AFFILIATE_APPLICATION_APPROVED : NotificationType.AFFILIATE_APPLICATION_REJECTED,
          title: `Affiliate ${updates.status}`,
          message: `Your affiliate account status changed to ${updates.status}.`,
          channels: ["in_app"],
          relatedEntity: { id: aff._id, model: "Affiliate" as any },
        });
      }
    }

    return successResponse("Affiliate updated", updated);
  } catch (err) {
    console.error("AFFILIATE PROFILE PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
