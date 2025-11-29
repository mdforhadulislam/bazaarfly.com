// ===================================================
// /api/order/[id] → GET | PUT | PATCH | DELETE
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Order } from "@/components/server/models/Order.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { parseUser } from "@/components/server/middleware/parseUser";
import {
  successResponse,
  errorResponse,
} from "@/components/server/utils/response";

interface Params {
  id: string;
}

// ---------------------------------------------------
// GET SINGLE ORDER (ADMIN OR OWNER)
// ---------------------------------------------------
export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();
  const { id } = context.params;

  const user = await parseUser(req);
  const admin = await checkAdmin(req);

  const order = await Order.findById(id).populate("items.product");

  if (!order) return errorResponse("Order not found", 404);

  if (!admin && order.user.toString() !== user?._id.toString()) {
    return errorResponse("Unauthorized", 403);
  }

  return successResponse("Order fetched", order);
}

// ---------------------------------------------------
// UPDATE ORDER — FULL REPLACE (ADMIN)
// ---------------------------------------------------
export async function PUT(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { id } = context.params;
  const body = await req.json();

  const updated = await Order.findByIdAndUpdate(id, body, { new: true });

  if (!updated) return errorResponse("Order not found", 404);

  return successResponse("Order updated", updated);
}

// ---------------------------------------------------
// UPDATE ORDER — PARTIAL UPDATE (ADMIN)
// ---------------------------------------------------
export async function PATCH(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { id } = context.params;
  const body = await req.json();

  const updated = await Order.findByIdAndUpdate(id, body, { new: true });

  if (!updated) return errorResponse("Order not found", 404);

  return successResponse("Order partially updated", updated);
}

// ---------------------------------------------------
// DELETE ORDER (ADMIN)
// ---------------------------------------------------
export async function DELETE(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const { id } = context.params;

  const deleted = await Order.findByIdAndDelete(id);

  if (!deleted) return errorResponse("Order not found", 404);

  return successResponse("Order deleted");
}
