// src/app/api/account/[phone]/notification/route.ts
// NOTIFICATIONS: GET list, PATCH mark read, DELETE remove (admin or owner)

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import { parseUser } from "@/server/middleware/parseUser";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/server/utils/response";

function parsePageLimit(sp: URLSearchParams) {
  const pageRaw = sp.get("page") || "1";
  const limitRaw = sp.get("limit") || "20";
  const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET list
export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone)
      return validationErrorResponse({
        phone: "phone required",
      } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    const { page, limit, skip } = parsePageLimit(req.nextUrl.searchParams);

    const [notifs, total] = await Promise.all([
      Notification.find({ recipient: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: user._id }),
    ]);

    return successResponse("Notifications fetched", {
      notifications: notifs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + notifs.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("NOTIFICATION LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PATCH mark as read or update notification
export async function PATCH(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone)
      return validationErrorResponse({
        phone: "phone required",
      } as Record<string, string>);

    const body = await req.json();
    const { id, markRead } = body ?? {};

    if (!id)
      return validationErrorResponse({
        id: "id required",
      } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const notif = await Notification.findById(id);
    if (!notif) return notFoundResponse("Notification not found");

    // optional: owner check (ensures user can't update others' notif even if phone mismatch bug)
    if (!admin) {
      const user = await User.findOne({
        phoneNumber: phone,
        isDeleted: { $ne: true },
      }).lean();
      if (!user) return notFoundResponse("User not found");

      if (String(notif.recipient) !== String(user._id)) {
        return unauthorizedResponse("Unauthorized");
      }
    }

    if (markRead) {
      notif.isRead = true;
      notif.readAt = new Date();
    }

    await notif.save();
    return successResponse("Notification updated", notif.toObject());
  } catch (err) {
    console.error("NOTIFICATION PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// DELETE a notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone)
      return validationErrorResponse({
        phone: "phone required",
      } as Record<string, string>);

    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return validationErrorResponse({
        id: "id required",
      } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const notif = await Notification.findById(id).lean();
    if (!notif) return notFoundResponse("Notification not found");

    // owner check again
    if (!admin) {
      const user = await User.findOne({
        phoneNumber: phone,
        isDeleted: { $ne: true },
      }).lean();
      if (!user) return notFoundResponse("User not found");

      if (String(notif.recipient) !== String(user._id)) {
        return unauthorizedResponse("Unauthorized");
      }
    }

    await Notification.findByIdAndDelete(id);

    return successResponse("Notification deleted");
  } catch (err) {
    console.error("NOTIFICATION DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
