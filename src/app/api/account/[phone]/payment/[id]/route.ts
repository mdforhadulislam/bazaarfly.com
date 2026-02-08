// src/app/api/account/[phone]/payment/[id]/route.ts
// SINGLE PAYMENT: GET / PUT / PATCH / DELETE (with notifications on status change)

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


const ALLOWED_UPDATE_FIELDS = [
  "amount",
  "method",
  "status",
  "transactionId",
  "gatewayResponse",
] as const;

function filterUpdates(input: any) {
  const updates: any = {};
  for (const k of ALLOWED_UPDATE_FIELDS) {
    if (input?.[k] !== undefined) updates[k] = input[k];
  }
  return updates;
}

function statusToNotif(status: string) {
  if (status === "paid") return NotificationType.PAYMENT_SUCCESS;
  if (status === "refunded") return NotificationType.PAYMENT_REFUNDED;
  if (status === "failed") return NotificationType.PAYMENT_FAILED;
  return NotificationType.PAYMENT_PENDING;
}

function statusToTitle(status: string) {
  if (status === "paid") return "Payment Successful";
  if (status === "refunded") return "Payment Refunded";
  if (status === "failed") return "Payment Failed";
  return "Payment Updated";
}

/**
 * GET single payment
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
) {
  try {
    await dbConnect();

    const { phone, id } = params;
    if (!phone || !id)
      return validationErrorResponse({
        phone: "phone & id required",
      } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

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
 * ✅ safer: only allows whitelisted fields (no full overwrite)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const body = await req.json();
    if (!body)
      return validationErrorResponse({
        body: "body required",
      } as Record<string, string>);

    const updates = filterUpdates(body);

    // basic validation
    if (updates.amount !== undefined && (isNaN(Number(updates.amount)) || Number(updates.amount) < 0)) {
      return validationErrorResponse({ amount: "amount must be a number >= 0" });
    }

    const replaced = await Payment.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!replaced) return notFoundResponse("Payment not found");

    // notify admin broadcast about update
    await Notification.createNotification({
      recipient: null,
      type: NotificationType.WALLET_PAYOUT_PROCESSED,
      title: "Payment updated",
      message: `Payment ${id} updated by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: replaced._id, model: "Payment" as any },
    });

    return successResponse("Payment updated", replaced);
  } catch (err) {
    console.error("SINGLE PAYMENT PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PATCH update partial (admin only) — detects status changes and notifies
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const body = await req.json();
    if (!body)
      return validationErrorResponse({
        updates: "updates required",
      } as Record<string, string>);

    const updates = filterUpdates(body);
    if (Object.keys(updates).length === 0) {
      return validationErrorResponse({ updates: "No valid fields to update" });
    }

    // validate amount if provided
    if (updates.amount !== undefined && (isNaN(Number(updates.amount)) || Number(updates.amount) < 0)) {
      return validationErrorResponse({ amount: "amount must be a number >= 0" });
    }

    const payment = await Payment.findById(id);
    if (!payment) return notFoundResponse("Payment not found");

    const prevStatus = String(payment.status);

    Object.assign(payment, updates);
    await payment.save();

    const newStatus = String(payment.status);

    if (prevStatus !== newStatus) {
      const user = await User.findById(payment.user).lean();

      // notify user
      if (user) {
        await Notification.createNotification({
          recipient: user._id,
          type: statusToNotif(newStatus),
          title: statusToTitle(newStatus),
          message: `Your payment (${payment._id}) status changed from ${prevStatus} to ${newStatus}.`,
          channels: ["in_app"],
          relatedEntity: { id: payment._id, model: "Payment" as any },
        });
      }

      // admin broadcast
      await Notification.createNotification({
        recipient: null,
        type: statusToNotif(newStatus),
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
) {
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
