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
import mongoose from "mongoose";

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
  try {
    await dbConnect();

    const user = await parseUser(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { items, addressId, shippingCost = 0, note } = body ?? {};

    // ✅ basic validation
    const errors: Record<string, string> = {};
    if (!Array.isArray(items) || items.length === 0) errors.items = "Items are required";
    if (!addressId) errors.addressId = "addressId is required";
    if (Object.keys(errors).length) return validationErrorResponse(errors);

    // ✅ address validate
    if (!mongoose.isValidObjectId(addressId)) {
      return validationErrorResponse({ addressId: "Invalid addressId" });
    }

    const address = await Address.findOne({ _id: addressId, user: user._id });
    if (!address) return errorResponse("Invalid address", 400);

    // ✅ validate each item + productId
    let subtotal = 0;
    const orderItems: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const productId = item?.product;
      const qty = Number(item?.quantity);

      if (!productId || !mongoose.isValidObjectId(productId)) {
        return validationErrorResponse({
          [`items[${i}].product`]: "Invalid product id",
        });
      }

      if (!qty || qty < 1) {
        return validationErrorResponse({
          [`items[${i}].quantity`]: "quantity must be at least 1",
        });
      }

      const product = await Product.findById(productId).lean();
      if (!product) return errorResponse("Invalid product", 400);

      const price = (product as any).discountPrice ?? (product as any).basePrice;
      subtotal += Number(price) * qty;

      orderItems.push({
        product: (product as any)._id,
        quantity: qty,
        price: Number(price),
      });
    }

    const totalAmount = subtotal + Number(shippingCost || 0);

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      subtotal,
      shippingCost: Number(shippingCost || 0),
      totalAmount,
      note,
      shippingAddress: address._id,
      customerPhone: user.phoneNumber,
    });

    return successResponse("Order created", order, 201);
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
