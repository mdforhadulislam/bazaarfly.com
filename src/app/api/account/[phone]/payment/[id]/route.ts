// SINGLE PAYMENT: GET / PUT / PATCH / DELETE (with notifications on status change)
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Payment } from "@/components/server/models/Payment.model";
import { User } from "@/components/server/models/User.model";
import { Notification, NotificationType } from "@/components/server/models/Notification.model";
import { parseUser } from "@/components/server/middleware/parseUser";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";

/**
 * GET single payment
 */
export async function GET(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const { phone, id } = params;
    if (!phone || !id) return validationErrorResponse({ phone: "phone & id required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const payment = await Payment.findById(id).lean();
    if (!payment) return notFoundResponse("Payment not found");

    return successResponse("Payment fetched", payment);
  } catch (err) {
    console.error("SINGLE PAYMENT GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PUT replace payment (admin only)
 */
export async function PUT(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const body = await req.json();
    if (!body) return validationErrorResponse({ body: "body required" } as any);

    const replaced = await Payment.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!replaced) return notFoundResponse("Payment not found");

    // notify admin broadcast about replacement
    await Notification.createNotification({
      recipient: null,
      type: NotificationType.WALLET_PAYOUT_PROCESSED,
      title: "Payment updated",
      message: `Payment ${id} replaced by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: replaced._id, model: "Payment" as any },
    });

    return successResponse("Payment replaced", replaced);
  } catch (err) {
    console.error("SINGLE PAYMENT PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PATCH update partial (admin only) — detects status changes and notifies
 */
export async function PATCH(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const updates = await req.json();
    if (!updates) return validationErrorResponse({ updates: "updates required" } as any);

    const payment = await Payment.findById(id);
    if (!payment) return notFoundResponse("Payment not found");

    const prevStatus = payment.status;
    Object.assign(payment, updates);
    await payment.save();

    const newStatus = payment.status;
    if (prevStatus !== newStatus) {
      // notify user and admin
      const user = await User.findById(payment.user).lean();
      if (user) {
        await Notification.createNotification({
          recipient: user._id,
          type:
            newStatus === "paid"
              ? NotificationType.PAYMENT_SUCCESS
              : newStatus === "refunded"
              ? NotificationType.PAYMENT_REFUNDED
              : newStatus === "failed"
              ? NotificationType.PAYMENT_FAILED
              : NotificationType.PAYMENT_PENDING,
          title:
            newStatus === "paid"
              ? "Payment Successful"
              : newStatus === "refunded"
              ? "Payment Refunded"
              : newStatus === "failed"
              ? "Payment Failed"
              : "Payment Updated",
          message: `Your payment (${payment._id}) status changed from ${prevStatus} to ${newStatus}.`,
          channels: ["in_app"],
          relatedEntity: { id: payment._id, model: "Payment" as any },
        });
      }

      await Notification.createNotification({
        recipient: null,
        type:
          newStatus === "paid"
            ? NotificationType.PAYMENT_SUCCESS
            : newStatus === "refunded"
            ? NotificationType.PAYMENT_REFUNDED
            : newStatus === "failed"
            ? NotificationType.PAYMENT_FAILED
            : NotificationType.PAYMENT_PENDING,
        title: `Payment ${newStatus}`,
        message: `Payment ${payment._id} status changed from ${prevStatus} to ${newStatus}.`,
        channels: ["in_app"],
        relatedEntity: { id: payment._id, model: "Payment" as any },
      });
    }

    return successResponse("Payment updated", payment.toObject());
  } catch (err) {
    console.error("SINGLE PAYMENT PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * DELETE (admin only)
 */
export async function DELETE(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const deleted = await Payment.findByIdAndDelete(id).lean();
    if (!deleted) return notFoundResponse("Payment not found");

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.WALLET_PAYOUT_PROCESSED,
      title: "Payment deleted",
      message: `Payment ${id} was deleted by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: deleted._id, model: "Payment" as any },
    });

    return successResponse("Payment deleted");
  } catch (err) {
    console.error("SINGLE PAYMENT DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
