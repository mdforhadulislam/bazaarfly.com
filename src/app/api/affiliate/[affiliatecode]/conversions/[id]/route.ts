// Admin: get single conversion (order) / patch (mark as fraud / adjust)
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Order } from "@/components/server/models/Order.model";
import { Notification, NotificationType } from "@/components/server/models/Notification.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    if (!id) return validationErrorResponse({ id: "id required" } as any);

    const order = await Order.findById(id).lean();
    if (!order) return notFoundResponse("Conversion/order not found");

    return successResponse("Conversion fetched", order);
  } catch (err) {
    console.error("AFFILIATE CONVERSION GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

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

    // support marking conversion invalid/fraud or adjusting affiliate/link
    if (updates.markAsFraud) {
      order.note = `${order.note || ""}\nMarked as fraud by admin ${admin._id} at ${new Date().toISOString()}`;
      // Optionally reduce affiliate conversion stats (not implemented automatically here)
    }

    if (updates.affiliate) order.affiliate = updates.affiliate;
    if (updates.link) order.link = updates.link;

    await order.save();

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.AFFILIATE_CONVERSION_RECORDED,
      title: "Conversion updated",
      message: `Conversion ${order._id} updated by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: order._id, model: "Order" as any },
    });

    return successResponse("Conversion updated", order.toObject());
  } catch (err) {
    console.error("AFFILIATE CONVERSION PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// DELETE conversion (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const order = await Order.findByIdAndUpdate(id, { link: null, affiliate: null }, { new: true }).lean();
    if (!order) return notFoundResponse("Conversion/order not found");

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.AFFILIATE_CONVERSION_RECORDED,
      title: "Conversion removed",
      message: `Conversion for order ${order._id} cleared by admin.`,
      channels: ["in_app"],
      relatedEntity: { id: order._id, model: "Order" as any },
    });

    return successResponse("Conversion cleared", order);
  } catch (err) {
    console.error("AFFILIATE CONVERSION DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
