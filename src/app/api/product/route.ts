import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Product } from "@/server/models/Product.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { rateLimit } from "@/server/middleware/rateLimit";
import { successResponse, errorResponse } from "@/server/utils/response";

// ==================================================
// GET — PUBLIC (Search + Filter + Pagination)
// ==================================================
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    await rateLimit(req);

    const q = req.nextUrl.searchParams;

    const page = Number(q.get("page") || 1);
    const limit = Number(q.get("limit") || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (q.get("category")) filter.category = q.get("category");
    if (q.get("tag")) filter.tags = q.get("tag");
    if (q.get("status")) filter.status = q.get("status");
    if (q.get("search")) filter.$text = { $search: q.get("search")! };

    let sort: any = { createdAt: -1 };
    if (q.get("sort") === "price_low") sort = { basePrice: 1 };
    if (q.get("sort") === "price_high") sort = { basePrice: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return successResponse("Products fetched", {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + items.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("PRODUCT LIST ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// ==================================================
// POST — ADMIN: CREATE PRODUCT
// ==================================================
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json();

    const skuExists = await Product.findOne({ sku: body.sku });
    if (skuExists) return errorResponse("SKU already exists", 409);

    const created = await Product.create(body);

    return successResponse("Product created", created, 201);
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
