// ===================================================
// /api/order/[id]/payment → POST | PUT | PATCH
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Order } from "@/server/models/Order.model";
import { Payment } from "@/server/models/Payment.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { parseUser } from "@/server/middleware/parseUser";
import {
  successResponse,
  errorResponse,
} from "@/server/utils/response";

interface Params {
  id: string;
}

// ---------------------------------------------------
// CREATE PAYMENT (USER)
// ---------------------------------------------------
export async function POST(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const user = await parseUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = context.params;
  const order = await Order.findById(id);
  if (!order) return errorResponse("Order not found", 404);

  if (order.user.toString() !== user._id.toString()) {
    return errorResponse("Unauthorized", 403);
  }

  const body = await req.json();
  const { method, transactionId, gatewayResponse } = body;

  const payment = await Payment.create({
    order: order._id,
    user: user._id,
    amount: order.totalAmount,
    method,
    transactionId,
    gatewayResponse,
    status: "paid",
  });

  await Order.findByIdAndUpdate(order._id, { paymentStatus: "paid" });

  return successResponse("Payment successful", payment);
}

// ---------------------------------------------------
// ADMIN — UPDATE PAYMENT
// ---------------------------------------------------
export async function PUT(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { id } = context.params;
  const body = await req.json();

  const updated = await Payment.findOneAndUpdate(
    { order: id },
    body,
    { new: true }
  );

  if (!updated) return errorResponse("Payment not found", 404);

  return successResponse("Payment updated", updated);
}

// ---------------------------------------------------
// ADMIN — PARTIAL UPDATE PAYMENT
// ---------------------------------------------------
export async function PATCH(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { id } = context.params;
  const body = await req.json();

  const updated = await Payment.findOneAndUpdate(
    { order: id },
    body,
    { new: true }
  );

  if (!updated) return errorResponse("Payment not found", 404);

  return successResponse("Payment partially updated", updated);
}
