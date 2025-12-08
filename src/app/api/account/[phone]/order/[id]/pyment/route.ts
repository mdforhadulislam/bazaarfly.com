// ORDER PAYMENT: GET payment for order, POST create payment (owner or admin) — notifies user + admin
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Payment } from "@/components/server/models/Payment.model";
import { Order, OrderStatus } from "@/components/server/models/Order.model";
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
 * GET: get payment for an order (owner or admin)
 */
export async function GET(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const { phone, id } = params;
    if (!phone || !id) return validationErrorResponse({ phone: "phone & id required" } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const order = await Order.findById(id).lean();
    if (!order) return notFoundResponse("Order not found");

    const payment = await Payment.findOne({ order: order._id }).lean();
    if (!payment) return notFoundResponse("Payment not found for order");

    return successResponse("Order payment fetched", payment);
  } catch (err) {
    console.error("ORDER PAYMENT GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * POST: create payment for an order (owner or admin)
 * Body: { amount, method, transactionId?, gatewayResponse?, status? }
 */
export async function POST(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await dbConnect();
    const { phone, id } = params;
    if (!phone || !id) return validationErrorResponse({ phone: "phone & id required" } as Record<string, string>);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const body = await req.json();
    const { amount, method, transactionId, gatewayResponse = {}, status = "paid" } = body ?? {};

    const errors: Record<string, string> = {};
    if (amount == null || isNaN(Number(amount))) errors.amount = "amount required and must be a number";
    if (!method) errors.method = "method required";
    if (Object.keys(errors).length) return validationErrorResponse(errors);

    const order = await Order.findById(id);
    if (!order) return notFoundResponse("Order not found");

    // create payment
    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      amount: Number(amount),
      method,
      status,
      transactionId,
      gatewayResponse,
    });

    // update order paymentStatus and maybe status
    order.paymentStatus = status === "paid" ? "paid" : status;
    if (status === "paid" && order.status === "pending") {
      order.status = OrderStatus.CONFIRMED;
    }
    await order.save();

    // notify user
    const user = await User.findById(order.user);
    if (user) {
      await Notification.createNotification({
        recipient: user._id,
        type: status === "paid" ? NotificationType.PAYMENT_SUCCESS : NotificationType.PAYMENT_PENDING,
        title: status === "paid" ? "Payment received" : "Payment pending",
        message: status === "paid" ? `We received ${payment.amount} for order ${order.orderNumber}.` : `Payment of ${payment.amount} is pending for order ${order.orderNumber}.`,
        channels: ["in_app"],
        relatedEntity: { id: payment._id, model: "Payment" as any },
      });
    }

    // admin broadcast
    await Notification.createNotification({
      recipient: null,
      type: status === "paid" ? NotificationType.PAYMENT_SUCCESS : NotificationType.PAYMENT_PENDING,
      title: `Order Payment ${status}`,
      message: `Payment ${payment._id} for order ${order.orderNumber} is ${status}.`,
      channels: ["in_app"],
      relatedEntity: { id: payment._id, model: "Payment" as any },
    });

    return successResponse("Payment created for order", payment);
  } catch (err) {
    console.error("ORDER PAYMENT CREATE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
