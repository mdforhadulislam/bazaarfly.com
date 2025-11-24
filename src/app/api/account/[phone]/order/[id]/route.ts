// SINGLE ORDER: GET / PUT / PATCH / DELETE — notifications on status change
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Order } from "@/components/server/models/Order.model";
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
 * GET single order
 */
export async function GET(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const { phone, id } = params;
    if (!phone || !id) return validationErrorResponse({ phone: "phone & id required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

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
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const body = await req.json();
    if (!body) return validationErrorResponse({ body: "body required" } as any);

    const replaced = await Order.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!replaced) return notFoundResponse("Order not found");

    // broadcast admin update
    await Notification.createNotification({
      recipient: null,
      type: NotificationType.SYSTEM_UPDATE,
      title: "Order updated",
      message: `Order ${replaced.orderNumber} updated by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: replaced._id, model: "Order" as any },
    });

    return successResponse("Order replaced", replaced);
  } catch (err) {
    console.error("SINGLE ORDER PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PATCH partial update (admin only) - watch for status changes and notify
 */
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

    const prevStatus = order.status;
    Object.assign(order, updates);
    await order.save();

    const newStatus = order.status;
    if (prevStatus !== newStatus) {
      // determine notification type
      let nt = NotificationType.ORDER_PROCESSING;
      if (newStatus === "confirmed") nt = NotificationType.ORDER_CONFIRMED;
      else if (newStatus === "processing") nt = NotificationType.ORDER_PROCESSING;
      else if (newStatus === "shipped") nt = NotificationType.ORDER_SHIPPED;
      else if (newStatus === "delivered") nt = NotificationType.ORDER_DELIVERED;
      else if (newStatus === "cancelled") nt = NotificationType.ORDER_CANCELLED;

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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
