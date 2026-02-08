// src/app/api/account/[phone]/payment/route.ts
// PAYMENT LIST / CREATE / DELETE with notifications (customer + admin broadcast)

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Payment } from "@/server/models/Payment.model";
import { User } from "@/server/models/User.model";
import { NotificationType } from "@/server/models/Notification.model";
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

/**
 * GET: list payments for a user (by phone)
 * Query: page, limit
 */
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

    const { page, limit, skip } = parsePageLimit(req.nextUrl.searchParams);

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    const [payments, total] = await Promise.all([
      Payment.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ user: user._id }),
    ]);

    return successResponse("Payments fetched", {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + payments.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("PAYMENT LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * POST: create a payment record (owner or admin)
 * Body: { orderId, amount, method, status?, transactionId?, gatewayResponse? }
 */
export async function POST(
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

    const body = await req.json();
    const {
      orderId,
      amount,
      method,
      status = "pending",
      transactionId,
      gatewayResponse,
    } = body ?? {};

    const errors: Record<string, string> = {};
    if (!orderId) errors.orderId = "orderId is required";
    if (amount == null || isNaN(Number(amount)))
      errors.amount = "amount is required and must be a number";
    if (Number(amount) < 0) errors.amount = "amount must be >= 0";
    if (!method) errors.method = "method is required";
    if (Object.keys(errors).length) return validationErrorResponse(errors);

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    // Optional: prevent duplicate payments for same order (recommended)
    // const already = await Payment.findOne({ order: orderId }).lean();
    // if (already) return errorResponse("Payment already exists for this order", 409);

    const payment = await Payment.create({
      order: orderId,
      user: user._id,
      amount: Number(amount),
      method,
      status,
      transactionId,
      gatewayResponse: gatewayResponse || {},
    });

    // Notify customer
    const userNotif = {
      recipient: user._id,
      type:
        status === "paid"
          ? NotificationType.PAYMENT_SUCCESS
          : status === "failed"
          ? NotificationType.PAYMENT_FAILED
          : NotificationType.PAYMENT_PENDING,
      title:
        status === "paid"
          ? "Payment Received"
          : status === "failed"
          ? "Payment Failed"
          : "Payment Pending",
      message:
        status === "paid"
          ? `We received your payment of ${payment.amount} for order ${orderId}.`
          : status === "failed"
          ? `Your payment of ${payment.amount} for order ${orderId} failed.`
          : `Your payment of ${payment.amount} for order ${orderId} is pending.`,
      channels: ["in_app"],
      relatedEntity: { id: payment._id, model: "Payment" as any },
    };

    await (await import("@/server/models/Notification.model")).Notification.createNotification(userNotif);

    // Admin broadcast (recipient null)
    await (await import("@/server/models/Notification.model")).Notification.createNotification({
      recipient: null,
      type: userNotif.type,
      title: `User Payment: ${status}`,
      message: `${user.name || user.phoneNumber} made a payment for order ${orderId} — status: ${status}`,
      channels: ["in_app"],
      relatedEntity: { id: payment._id, model: "Payment" as any },
    });

    return successResponse("Payment created", payment);
  } catch (err) {
    console.error("PAYMENT CREATE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * DELETE: admin only - remove payment by id (query ?id=)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return validationErrorResponse({
        id: "id required",
      } as Record<string, string>);

    const deleted = await Payment.findByIdAndDelete(id).lean();
    if (!deleted) return notFoundResponse("Payment not found");

    // notify admin broadcast that payment removed (optional)
    await (await import("@/server/models/Notification.model")).Notification.createNotification({
      recipient: null,
      type: NotificationType.WALLET_PAYOUT_PROCESSED,
      title: "Payment deleted",
      message: `Payment ${id} was deleted by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: deleted._id, model: "Payment" as any },
    });

    return successResponse("Payment deleted");
  } catch (err) {
    console.error("PAYMENT DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
