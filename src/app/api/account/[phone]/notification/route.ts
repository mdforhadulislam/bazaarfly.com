// NOTIFICATIONS: GET list, PATCH mark read, DELETE remove (admin or owner)
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Notification } from "@/components/server/models/Notification.model";
import { User } from "@/components/server/models/User.model";
import { parseUser } from "@/components/server/middleware/parseUser";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";

// GET list
export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    if (!phone) return validationErrorResponse({ phone: "phone required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const user = await User.findOne({ phoneNumber: phone }).lean();
    if (!user) return notFoundResponse("User not found");

    const { page = "1", limit = "20" } = Object.fromEntries(req.nextUrl.searchParams);
    const pageNum = Number(page), limitNum = Number(limit), skip = (pageNum - 1) * limitNum;

    const [notifs, total] = await Promise.all([
      Notification.find({ recipient: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments({ recipient: user._id }),
    ]);

    return successResponse("Notifications fetched", { notifications: notifs, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), hasNextPage: skip + notifs.length < total, hasPrevPage: pageNum > 1 } });
  } catch (err) {
    console.error("NOTIFICATION LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PATCH mark as read or update notification
export async function PATCH(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const body = await req.json();
    const { id, markRead } = body;
    if (!id) return validationErrorResponse({ id: "id required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const notif = await Notification.findById(id);
    if (!notif) return notFoundResponse("Notification not found");

    if (markRead) {
      notif.isRead = true;
      notif.readAt = new Date();
    }
    // other updates allowed via body
    await notif.save();

    return successResponse("Notification updated", notif);
  } catch (err) {
    console.error("NOTIFICATION PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// DELETE a notification
export async function DELETE(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return validationErrorResponse({ id: "id required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const deleted = await Notification.findByIdAndDelete(id).lean();
    if (!deleted) return notFoundResponse("Notification not found");
    return successResponse("Notification deleted");
  } catch (err) {
    console.error("NOTIFICATION DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
