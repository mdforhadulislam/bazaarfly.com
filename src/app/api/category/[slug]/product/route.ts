import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Category } from "@/server/models/Category.model";
import { Product } from "@/server/models/Product.model";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/server/utils/response";
import { checkAdmin } from "@/server/middleware/checkAdmin";

// ===============================
// GET — Products under category
// ===============================
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const category = await Category.findOne({ slug: params.slug }).lean();
    if (!category) return errorResponse("Category not found", 404);

    const products = await Product.find({ category: category._id }).sort({
      createdAt: -1,
    });

    return successResponse("Products loaded", products);
  } catch (error) {
    console.error(error);
    return errorResponse("Could not load products");
  }
}

// ===============================
// POST — Create product under this category (Admin)
// ===============================
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin only", 403);

    await dbConnect();

    const category = await Category.findOne({ slug: params.slug }).lean();
    if (!category) return errorResponse("Category not found", 404);

    const body = await req.json();

    if (!body.name || !body.basePrice || !body.sku) {
      return validationErrorResponse({
        name: "Required",
        basePrice: "Required",
        sku: "Required",
      });
    }

    const product = await Product.create({
      ...body,
      category: category._id,
    });

    return successResponse("Product created", product, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create product");
  }
}
