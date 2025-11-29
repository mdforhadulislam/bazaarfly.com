// src/app/api/payment/[id]/route.ts
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Payment } from "@/components/server/models/Payment.model";
import { Order, PaymentStatus } from "@/components/server/models/Order.model";
import { Wallet, TransactionType, TransactionStatus } from "@/components/server/models/Wallet.model";
import { Affiliate } from "@/components/server/models/Affiliate.model";
import { Link } from "@/components/server/models/Link.model";
import { parseUser } from "@/components/server/middleware/parseUser";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { rateLimit } from "@/components/server/middleware/rateLimit";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/components/server/utils/response";
import { Notification, NotificationType } from "@/components/server/models/Notification.model";

interface Params { id: string; }

export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  await rateLimit(req);

  try {
    const { id } = context.params;
    const user = await parseUser(req).catch(() => null);
    const admin = await checkAdmin(req).catch(() => null);

    const payment = await Payment.findById(id).populate("order").lean();
    if (!payment) return errorResponse("Payment not found", 404);

    if (!admin && (!user || payment.user.toString() !== user._id.toString())) {
      return errorResponse("Unauthorized", 403);
    }

    return successResponse("Payment fetched", payment);
  } catch (err) {
    console.error("PAYMENT GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PUT = full update (admin)
export async function PUT(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  await rateLimit(req);

  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin only", 403);

    const { id } = context.params;
    const updates = await req.json();

    const updated = await Payment.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return errorResponse("Payment not found", 404);

    // Sync order if status provided
    if (updates.status && updated.order) {
      await Order.findByIdAndUpdate(updated.order, { paymentStatus: updates.status });
    }

    return successResponse("Payment updated", updated);
  } catch (err) {
    console.error("PAYMENT PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PATCH = partial update or actions (admin)
// Supports: { action: "refund", amount?, reason? }
export async function PATCH(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  await rateLimit(req);

  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin only", 403);

    const { id } = context.params;
    const body = await req.json().catch(() => ({}));

    const payment = await Payment.findById(id);
    if (!payment) return errorResponse("Payment not found", 404);

    const order = await Order.findById(payment.order);
    if (!order) return errorResponse("Related order not found", 404);

    // -----------------------------
    // REFUND ACTION
    // -----------------------------
    if (body.action === "refund") {
      const refundAmount = typeof body.amount === "number" ? body.amount : payment.amount;
      const reason = body.reason || "Admin refund";

      // mark payment refunded
      payment.status = PaymentStatus.REFUNDED;
      (payment as any).refundedAt = new Date();
      (payment as any).refundMeta = { amount: refundAmount, reason };
      await payment.save();

      // update order
      order.paymentStatus = PaymentStatus.REFUNDED;
      await order.save();

      // Reverse affiliate commission if exists
      if (order.affiliate && order.affiliateCommission && order.affiliateCommission > 0) {
        try {
          const wallet = await Wallet.findByAffiliate(order.affiliate as any);
          if (wallet) {
            // find transaction related to this order
            const txIndex = wallet.transactions.findIndex(
              (t: any) =>
                t.relatedId?.toString() === (order._id as any).toString()
            );

            if (txIndex !== -1) {
              const tx = wallet.transactions[txIndex] as any;

              if (tx.status === TransactionStatus.PENDING) {
                // Remove pending tx, subtract heldBalance & totalEarnings
                wallet.transactions.splice(txIndex, 1);
                wallet.heldBalance = Math.max(0, wallet.heldBalance - tx.amount);
                wallet.totalEarnings = Math.max(0, wallet.totalEarnings - tx.amount);
                await wallet.save();
              } else if (tx.status === TransactionStatus.COMPLETED) {
                // If already released, deduct from availableBalance and totalEarnings
                wallet.availableBalance = Math.max(0, wallet.availableBalance - tx.amount);
                wallet.totalEarnings = Math.max(0, wallet.totalEarnings - tx.amount);

                // Add an adjustment transaction to record the deduction
                await wallet.addTransaction(
                  TransactionType.ADJUSTMENT,
                  -1 * tx.amount,
                  `Reversal for refunded Order #${order._id}`,
                  TransactionStatus.COMPLETED,
                  order._id as any
                );
              }
            } else {
              // No direct transaction found - just ensure affiliate totals corrected if needed
              // (best-effort)
            }

            // Update affiliate stats
            await Affiliate.findByIdAndUpdate(order.affiliate, {
              $inc: { totalEarnings: -(order.affiliateCommission || 0), totalConversions: -1 },
            });
          }
        } catch (e) {
          console.error("WALLET REFUND REVERSAL ERROR:", e);
        }

        // decrement link conversions if link exists
        if (order.link) {
          try {
            await Link.findByIdAndUpdate(order.link, { $inc: { conversions: -1 } });
          } catch {}
        }
      } // end affiliate reversal

      // Notifications
      try {
        await Notification.createNotification({
          recipient: payment.user,
          type: NotificationType.PAYMENT_REFUNDED,
          title: "Payment refunded",
          message: `Payment for Order ${order.orderNumber || order._id} has been refunded (${refundAmount}).`,
          channels: ["in_app", "email"],
          relatedEntity: { id: payment._id, model: "Payment" as any },
        });
      } catch {}

      return successResponse("Payment refunded", payment);
    }

    // -----------------------------
    // Other partial updates (admin)
    // -----------------------------
    const allowed = ["status", "transactionId", "gatewayResponse"];
    let updatedFields: any = {};
    for (const k of Object.keys(body)) {
      if (allowed.includes(k)) updatedFields[k] = body[k];
    }
    if (Object.keys(updatedFields).length === 0) {
      return validationErrorResponse({ action: "No valid fields or action provided" });
    }

    const updated = await Payment.findByIdAndUpdate(payment._id, updatedFields, { new: true });
    if (!updated) return errorResponse("Payment not found", 404);

    // sync order paymentStatus if status changed
    if (updatedFields.status) {
      await Order.findByIdAndUpdate(updated.order, { paymentStatus: updatedFields.status });
    }

    return successResponse("Payment updated", updated);
  } catch (err) {
    console.error("PAYMENT PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// DELETE -> admin delete payment (Q3: set order.paymentStatus = 'pending')
export async function DELETE(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  await rateLimit(req);

  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin only", 403);

    const { id } = context.params;
    const payment = await Payment.findById(id);
    if (!payment) return errorResponse("Payment not found", 404);

    // Reset order paymentStatus to pending (Q3 behavior)
    try {
      await Order.findByIdAndUpdate(payment.order, { paymentStatus: "pending" });
    } catch (e) {
      console.error("Failed to reset order paymentStatus on payment delete:", e);
    }

    await payment.deleteOne();

    return successResponse("Payment deleted and order reset to pending");
  } catch (err) {
    console.error("PAYMENT DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
