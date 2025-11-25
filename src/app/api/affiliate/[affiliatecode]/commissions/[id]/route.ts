// Admin: get single commission (order) / update commission / delete (rare)
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Order } from "@/components/server/models/Order.model";
import { Wallet } from "@/components/server/models/Wallet.model";
import { Affiliate } from "@/components/server/models/Affiliate.model";
import { Notification, NotificationType } from "@/components/server/models/Notification.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";
import { Types } from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    if (!id) return validationErrorResponse({ id: "id required" } as any);

    const order = await Order.findById(id).lean();
    if (!order) return notFoundResponse("Commission/order not found");

    return successResponse("Commission fetched", order);
  } catch (err) {
    console.error("AFFILIATE COMMISSION GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PATCH -> adjust affiliateCommission or release funds manually
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const updates = await req.json();
    if (!updates) return validationErrorResponse({ updates: "updates required" } as any);

    const order = await Order.findById(id);
    if (!order) return notFoundResponse("Order not found");

    const prevCommission = order.affiliateCommission || 0;

    if (updates.affiliateCommission !== undefined) {
      order.affiliateCommission = Number(updates.affiliateCommission);
    }
    // Optionally allow marking as released
    if (updates.release === true && order.affiliate && order.affiliateCommission > 0) {
      // find wallet and move held -> available
      const wallet = await Wallet.findByAffiliate(order.affiliate as Types.ObjectId);
      if (wallet) {
        await wallet.releaseHeldFunds(order._id as Types.ObjectId);
      }
    }

    await order.save();

    // notify affiliate & admin broadcast if commission changed or released
    if (prevCommission !== order.affiliateCommission) {
      const aff = await Affiliate.findById(order.affiliate).populate("user").lean();
      const notifMsg = `Commission for order ${order.orderNumber} updated from ${prevCommission} to ${order.affiliateCommission}.`;
      if (aff && (aff as any).user) {
        await Notification.createNotification({
          recipient: (aff as any).user,
          type: NotificationType.AFFILIATE_COMMISSION_CONFIRMED,
          title: "Commission updated",
          message: notifMsg,
          channels: ["in_app"],
          relatedEntity: { id: order._id, model: "Order" as any },
        });
      }

      await Notification.createNotification({
        recipient: null,
        type: NotificationType.AFFILIATE_COMMISSION_CONFIRMED,
        title: "Commission updated",
        message: `Admin updated commission: ${notifMsg}`,
        channels: ["in_app"],
        relatedEntity: { id: order._id, model: "Order" as any },
      });
    }

    return successResponse("Commission updated", order.toObject());
  } catch (err) {
    console.error("AFFILIATE COMMISSION PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// DELETE (admin only) - rarely used
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const order = await Order.findById(id);
    if (!order) return notFoundResponse("Order not found");

    // reset commission
    order.affiliateCommission = 0;
    await order.save();

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.AFFILIATE_COMMISSION_CONFIRMED,
      title: "Commission removed",
      message: `Commission for order ${order.orderNumber} removed by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: order._id, model: "Order" as any },
    });

    return successResponse("Commission cleared for order", { id: order._id });
  } catch (err) {
    console.error("AFFILIATE COMMISSION DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
