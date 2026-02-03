import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Product } from "@/server/models/Product.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/server/utils/response";
import { cloudinaryConfig } from "@/server/config/cloudinary";

interface Params {
  slug: string;
}

// ==================================================
// GET — PUBLIC: Single Product
// ==================================================
export async function GET(req: NextRequest, ctx: { params: Params }) {
  try {
    await dbConnect();

    const { slug } = ctx.params;

    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .lean();

    if (!product) return errorResponse("Product not found", 404);

    return successResponse("Product fetched", product);
  } catch (error) {
    console.error("PRODUCT GET ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// ==================================================
// PUT — ADMIN: Update Product (No Image)
// ==================================================
export async function PUT(req: NextRequest, ctx: { params: Params }) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const { slug } = ctx.params;
    const updates = await req.json();

    const updated = await Product.findOneAndUpdate({ slug }, updates, {
      new: true,
    });

    if (!updated) return errorResponse("Product not found", 404);

    return successResponse("Product updated", updated);
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// ==================================================
// PATCH — ADMIN: Upload Product Images
// ==================================================
export async function PATCH(req: NextRequest, ctx: { params: Params }) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const cloudinary = cloudinaryConfig();

    const { slug } = ctx.params;
    const type = req.nextUrl.searchParams.get("type") || "image";

    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) return errorResponse("Image file missing", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "bazaarfly/products" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(buffer);
    });

    const url = (uploadResult as any).secure_url;

    const update: any = {};
    if (type === "image") update.$push = { images: url };
    else update[type] = url;

    const updated = await Product.findOneAndUpdate({ slug }, update, {
      new: true,
    });

    if (!updated) return errorResponse("Product not found", 404);

    return successResponse("Product " + type + " updated", updated);
  } catch (error) {
    console.error("PRODUCT IMAGE UPLOAD ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// ==================================================
// DELETE — ADMIN: Delete Product
// ==================================================
export async function DELETE(req: NextRequest, ctx: { params: Params }) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const { slug } = ctx.params;

    const deleted = await Product.findOneAndDelete({ slug });

    if (!deleted) return errorResponse("Product not found", 404);

    return successResponse("Product deleted");
  } catch (error) {
    console.error("PRODUCT DELETE ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
