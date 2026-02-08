// PAYMENT LIST / CREATE / DELETE with notifications (customer + admin broadcast)
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Payment } from "@/server/models/Payment.model";
import { User } from "@/server/models/User.model";
import { Notification, NotificationType } from "@/server/models/Notification.model";
import { parseUser } from "@/server/middleware/parseUser";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/server/utils/response";

/**
 * GET: list payments for a user (by phone)
 * Query: page, limit
 */
export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    if (!phone) return validationErrorResponse({ phone: "phone required" } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const { page = "1", limit = "20" } = Object.fromEntries(req.nextUrl.searchParams);
    const pageNum = Number(page), limitNum = Number(limit), skip = (pageNum - 1) * limitNum;

    const user = await User.findOne({ phoneNumber: phone }).lean();
    if (!user) return notFoundResponse("User not found");

    const [payments, total] = await Promise.all([
      Payment.find({ user: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Payment.countDocuments({ user: user._id }),
    ]);

    return successResponse("Payments fetched", {
      payments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: skip + payments.length < total,
        hasPrevPage: pageNum > 1,
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
export async function POST(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    if (!phone) return validationErrorResponse({ phone: "phone required" } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const body = await req.json();
    const { orderId, amount, method, status = "pending", transactionId, gatewayResponse } = body ?? {};

    // Strict validation
    const errors: Record<string, string> = {};
    if (!orderId) errors.orderId = "orderId is required";
    if (amount == null || isNaN(Number(amount))) errors.amount = "amount is required and must be a number";
    if (!method) errors.method = "method is required";
    if (Object.keys(errors).length) return validationErrorResponse(errors);

    const user = await User.findOne({ phoneNumber: phone }).lean();
    if (!user) return notFoundResponse("User not found");

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
      type: status === "paid" ? NotificationType.PAYMENT_SUCCESS : status === "failed" ? NotificationType.PAYMENT_FAILED : NotificationType.PAYMENT_PENDING,
      title: status === "paid" ? "Payment Received" : status === "failed" ? "Payment Failed" : "Payment Pending",
      message:
        status === "paid"
          ? `We received your payment of ${payment.amount} for order ${orderId}.`
          : status === "failed"
          ? `Your payment of ${payment.amount} for order ${orderId} failed.`
          : `Your payment of ${payment.amount} for order ${orderId} is pending.`,
      channels: ["in_app"],
      relatedEntity: { id: payment._id, model: "Payment" as any },
    };
    await Notification.createNotification(userNotif);

    // Admin broadcast (recipient null)
    await Notification.createNotification({
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
export async function DELETE(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return validationErrorResponse({ id: "id required" } as Record<string, string>);

    const deleted = await Payment.findByIdAndDelete(id).lean();
    if (!deleted) return notFoundResponse("Payment not found");

    // notify admin broadcast that payment removed (optional)
    await Notification.createNotification({
      recipient: null,
      type: NotificationType.WALLET_PAYOUT_PROCESSED, // generic - or you can make a new type
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
