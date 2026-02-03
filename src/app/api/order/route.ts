// ===================================================
// /api/order → GET (admin) | POST (user)
// ===================================================

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Order } from "@/server/models/Order.model";
import { Product } from "@/server/models/Product.model";
import { Address } from "@/server/models/Address.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { parseUser } from "@/server/middleware/parseUser";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/server/utils/response";

// ---------------------------------------------------
// GET ALL ORDERS (ADMIN)
// ---------------------------------------------------
export async function GET(req: NextRequest) {
  await dbConnect();

  const admin = await checkAdmin(req);
  if (!admin) return errorResponse("Unauthorized", 401);

  const orders = await Order.find()
    .populate("user", "name email phoneNumber")
    .populate("items.product")
    .sort({ createdAt: -1 });

  return successResponse("Orders fetched", orders);
}

// ---------------------------------------------------
// CREATE ORDER (USER)
// ---------------------------------------------------
export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await parseUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await req.json();
  const { items, addressId, shippingCost, note } = body;

  if (!items || items.length === 0) {
    return validationErrorResponse({ items: "Items are required" });
  }

  const address = await Address.findOne({ _id: addressId, user: user._id });
  if (!address) return errorResponse("Invalid address", 400);

  // subtotal calculation
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return errorResponse("Invalid product", 400);

    const price = product.discountPrice ?? product.basePrice;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price,
    });
  }

  const totalAmount = subtotal + (shippingCost || 0);

  const order = await Order.create({
    user: user._id,
    items: orderItems,
    subtotal,
    shippingCost,
    totalAmount,
    note,
    shippingAddress: address._id,
    customerPhone: user.phoneNumber,
  });

  return successResponse("Order created", order, 201);
}
