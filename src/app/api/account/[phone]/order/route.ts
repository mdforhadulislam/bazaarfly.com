// src/app/api/account/[phone]/order/route.ts
// ORDERS: GET list, POST create, DELETE cancel — notifications on create/cancel

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

// ✅ Optional: If you have a Product model, import it and enable DB pricing.
// import { Product } from "@/server/models/Product.model";


function parsePageLimit(sp: URLSearchParams) {
  const pageRaw = sp.get("page") || "1";
  const limitRaw = sp.get("limit") || "20";
  const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * GET: list orders for user (by phone)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone) return validationErrorResponse({ phone: "phone required" });

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") || "";
    const { page, limit, skip } = parsePageLimit(sp);

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    const query: any = { user: user._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return successResponse("Orders fetched", {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + orders.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("ORDER LIST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * POST: create order (owner or admin) — strict validation + notify
 * Body: { items: [{product, quantity, price?}], shippingAddress, shippingCost?, affiliate?, link? }
 *
 * ✅ NOTE:
 * - Production-safe subtotal should be calculated from Product DB price.
 * - Here: we keep fallback to client price if Product model isn't wired.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    if (!phone)
      return validationErrorResponse({ phone: "phone required" } as Record<
        string,
        string
      >);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const body = await req.json();
    const {
      items,
      shippingAddress,
      shippingCost = 0,
      affiliate = null,
      link = null,
    } = body ?? {};

    // Strict validation
    const errors: Record<string, string> = {};
    if (!items || !Array.isArray(items) || items.length === 0)
      errors.items = "items (non-empty array) required";
    if (!shippingAddress) errors.shippingAddress = "shippingAddress required";

    // Validate items shape
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it?.product) errors[`items.${i}.product`] = "product is required";
        const qty = Number(it?.quantity);
        if (!qty || qty < 1)
          errors[`items.${i}.quantity`] = "quantity must be >= 1";
      }
    }

    if (Object.keys(errors).length) return validationErrorResponse(errors);

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    // ✅ Production-safe subtotal calculation (recommended):
    // If you have Product model, uncomment and use it.
    //
    // const productIds = items.map((it: any) => it.product);
    // const products = await Product.find({ _id: { $in: productIds } })
    //   .select("_id price salePrice")
    //   .lean();
    // const priceMap = new Map(products.map(p => [String(p._id), Number(p.salePrice ?? p.price ?? 0)]));
    // const subtotal = items.reduce((s: number, it: any) => s + (priceMap.get(String(it.product)) || 0) * Number(it.quantity), 0);

    // 🔁 Fallback subtotal (temporary): uses client-provided price
    const subtotal = items.reduce(
      (s: number, it: { price?: string | number; quantity?: string | number }) =>
        s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );

    const totalAmount = subtotal + Number(shippingCost || 0);

    const created = await Order.create({
      user: user._id,
      items,
      subtotal,
      shippingCost,
      totalAmount,
      shippingAddress,
      affiliate,
      link,
      paymentStatus: "pending",
      status: "pending",
      customerPhone: phone,
    });

    // Notify customer
    await Notification.createNotification({
      recipient: user._id,
      type: NotificationType.ORDER_PLACED,
      title: "Order placed",
      message: `Your order ${created.orderNumber} has been placed successfully.`,
      channels: ["in_app"],
      relatedEntity: { id: created._id, model: "Order" as any },
    });

    // Admin broadcast
    await Notification.createNotification({
      recipient: null,
      type: NotificationType.ORDER_PLACED,
      title: "New Order placed",
      message: `Order ${created.orderNumber} placed by ${user.name || user.phoneNumber}.`,
      channels: ["in_app"],
      relatedEntity: { id: created._id, model: "Order" as any },
    });

    return successResponse("Order created", created);
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * DELETE: cancel order (owner or admin) — marks status cancelled + notify
 * query: ?id=
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await dbConnect();

    const phone = params.phone;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return validationErrorResponse({ id: "id required" });

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const order = await Order.findById(id);
    if (!order) return notFoundResponse("Order not found");

    // optional: prevent cancelling delivered orders
    if (order.status === OrderStatus.DELIVERED) {
      return errorResponse("Delivered order cannot be cancelled", 400);
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    // notify customer
    const user = await User.findById(order.user).lean();
    if (user) {
      await Notification.createNotification({
        recipient: user._id,
        type: NotificationType.ORDER_CANCELLED,
        title: "Order cancelled",
        message: `Your order ${order.orderNumber} has been cancelled.`,
        channels: ["in_app"],
        relatedEntity: { id: order._id, model: "Order" as any },
      });
    }

    // admin broadcast
    await Notification.createNotification({
      recipient: null,
      type: NotificationType.ORDER_CANCELLED,
      title: "Order cancelled",
      message: `Order ${order.orderNumber} has been cancelled.`,
      channels: ["in_app"],
      relatedEntity: { id: order._id, model: "Order" as any },
    });

    return successResponse("Order cancelled", { id: order._id });
  } catch (err) {
    console.error("ORDER DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
