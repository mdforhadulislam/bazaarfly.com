// src/app/api/payment/route.ts
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Payment } from "@/server/models/Payment.model";
import { Order, PaymentStatus } from "@/server/models/Order.model";
import { Wallet } from "@/server/models/Wallet.model";
import { Affiliate } from "@/server/models/Affiliate.model";
import { Link } from "@/server/models/Link.model";
import { parseUser } from "@/server/middleware/parseUser";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { rateLimit } from "@/server/middleware/rateLimit";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/server/utils/response";
import { Notification, NotificationType } from "@/server/models/Notification.model";

export async function GET(req: NextRequest) {
  await dbConnect();
  await rateLimit(req);

  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin only", 403);

    const q = Object.fromEntries(req.nextUrl.searchParams.entries());
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(200, Number(q.limit) || 50);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q.status) filter.status = q.status;
    if (q.method) filter.method = q.method;
    if (q.userId) filter.user = q.userId;
    if (q.orderId) filter.order = q.orderId;

    const [items, total] = await Promise.all([
      Payment.find(filter)
        .populate("user", "name email phoneNumber")
        .populate("order")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return successResponse("Payments fetched", {
      payments: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: skip + items.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("PAYMENT LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  await rateLimit(req);

  try {
    const user = await parseUser(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const { orderId, method, transactionId, gatewayResponse } = body || {};

    if (!orderId) return validationErrorResponse({ orderId: "Order ID required" });
    if (!method) return validationErrorResponse({ method: "Method required" });

    const order = await Order.findById(orderId);
    if (!order) return errorResponse("Order not found", 404);

    // owner check
    if (order.user.toString() !== user._id.toString()) return errorResponse("Cannot pay for this order", 403);

    // Prevent double payment
    const existing = await Payment.findOne({ order: order._id });
    if (existing) return errorResponse("Payment already exists for this order", 400);

    // Create payment (mark paid)
    const payment = await Payment.create({
      order: order._id,
      user: user._id,
      amount: order.totalAmount,
      method,
      transactionId: transactionId ?? undefined,
      gatewayResponse: gatewayResponse ?? undefined,
      status: "paid",
    });

    // Update order paymentStatus
    order.paymentStatus = PaymentStatus.PAID;
    await order.save();

    // --- Q1: Commission calculation on payment success ---
    // If affiliate attached and commission > 0 then add held commission to wallet
    if (order.affiliate && order.affiliateCommission && order.affiliateCommission > 0) {
      try {
        const wallet = await Wallet.findByAffiliate(order.affiliate as any);
        if (wallet) {
          await wallet.addHeldCommission(order.affiliateCommission, order._id as any);
        } else {
          // If wallet doesn't exist, create one
          const newWallet = await Wallet.create({
            affiliate: order.affiliate,
            availableBalance: 0,
            heldBalance: 0,
            totalEarnings: 0,
            totalPayouts: 0,
            transactions: [],
          });
          await newWallet.addHeldCommission(order.affiliateCommission, order._id as any);
        }

        // Update Affiliate stats
        await Affiliate.findByIdAndUpdate(order.affiliate, {
          $inc: { totalConversions: 1, totalEarnings: order.affiliateCommission },
        });

        // If link exists, increment conversions
        if (order.link) {
          await Link.findByIdAndUpdate(order.link, { $inc: { conversions: 1 } });
        }
      } catch (e) {
        console.error("WALLET COMMISSION ERROR (on payment):", e);
        // don't fail payment — just log
      }
    }

    // Notification to user + admin (best-effort)
    try {
      await Notification.createNotification({
        recipient: user._id,
        type: NotificationType.PAYMENT_SUCCESS,
        title: "Payment received",
        message: `Payment of ${payment.amount} received for Order ${order.orderNumber || order._id}`,
        channels: ["in_app", "email"],
        relatedEntity: { id: payment._id, model: "Payment" as any },
      });
    } catch {}

    return successResponse("Payment created", payment, 201);
  } catch (err) {
    console.error("PAYMENT CREATE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
