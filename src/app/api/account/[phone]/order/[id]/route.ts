// src/app/api/account/[phone]/order/[id]/route.ts
// SINGLE ORDER: GET / PUT / PATCH / DELETE — notifications on status change

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Order, OrderStatus } from "@/server/models/Order.model";
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


// ✅ Restrict what admin can update (avoid overwriting user/orderNumber/etc accidentally)
const ALLOWED_ORDER_UPDATE_FIELDS = [
  "status",
  "paymentStatus",
  "shippingAddress",
  "shippingCost",
  "items",
  "notes",
  "trackingNumber",
  "courier",
] as const;

function filterOrderUpdates(input: any) {
  const updates: any = {};
  for (const k of ALLOWED_ORDER_UPDATE_FIELDS) {
    if (input?.[k] !== undefined) updates[k] = input[k];
  }
  return updates;
}

function statusToNotifType(status: string) {
  switch (status) {
    case "confirmed":
      return NotificationType.ORDER_CONFIRMED;
    case "processing":
      return NotificationType.ORDER_PROCESSING;
    case "shipped":
      return NotificationType.ORDER_SHIPPED;
    case "delivered":
      return NotificationType.ORDER_DELIVERED;
    case "cancelled":
      return NotificationType.ORDER_CANCELLED;
    default:
      return NotificationType.ORDER_PROCESSING;
  }
}

/**
 * GET single order
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

    const order = await Order.findById(id).lean();
    if (!order) return notFoundResponse("Order not found");

    return successResponse("Order fetched", order);
  } catch (err) {
    console.error("SINGLE ORDER GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PUT full replace (admin only)
 * ✅ safer: only updates whitelisted fields (not full overwrite)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const updates = filterOrderUpdates(body);
    if (Object.keys(updates).length === 0) {
      return validationErrorResponse({ body: "No valid fields to update" });
    }

    const replaced = await Order.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!replaced) return notFoundResponse("Order not found");

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.SYSTEM_UPDATE,
      title: "Order updated",
      message: `Order ${replaced.orderNumber} updated by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: replaced._id, model: "Order" as any },
    });

    return successResponse("Order updated", replaced);
  } catch (err) {
    console.error("SINGLE ORDER PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PATCH partial update (admin only) - watch for status changes and notify
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const updates = filterOrderUpdates(body);
    if (Object.keys(updates).length === 0) {
      return validationErrorResponse({ updates: "No valid fields to update" });
    }

    const order = await Order.findById(id);
    if (!order) return notFoundResponse("Order not found");

    const prevStatus = String(order.status);

    Object.assign(order, updates);
    await order.save();

    const newStatus = String(order.status);

    if (prevStatus !== newStatus) {
      const nt = statusToNotifType(newStatus);

      // notify user
      const user = await User.findById(order.user).lean();
      if (user) {
        await Notification.createNotification({
          recipient: user._id,
          type: nt,
          title: `Order ${newStatus}`,
          message: `Your order ${order.orderNumber} is now ${newStatus}.`,
          channels: ["in_app"],
          relatedEntity: { id: order._id, model: "Order" as any },
        });
      }

      // admin broadcast
      await Notification.createNotification({
        recipient: null,
        type: nt,
        title: `Order ${newStatus}`,
        message: `Order ${order.orderNumber} changed from ${prevStatus} to ${newStatus}.`,
        channels: ["in_app"],
        relatedEntity: { id: order._id, model: "Order" as any },
      });
    }

    return successResponse("Order updated", order.toObject());
  } catch (err) {
    console.error("SINGLE ORDER PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * DELETE hard (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;

    const deleted = await Order.findByIdAndDelete(id).lean();
    if (!deleted) return notFoundResponse("Order not found");

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title: "Order removed",
      message: `Order ${deleted.orderNumber} removed by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: deleted._id, model: "Order" as any },
    });

    return successResponse("Order deleted");
  } catch (err) {
    console.error("SINGLE ORDER DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
