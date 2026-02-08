import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Category } from "@/server/models/Category.model";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/server/utils/response";
import { checkAdmin } from "@/server/middleware/checkAdmin";

// ===============================
// GET — All Categories + Tree
// ===============================
export async function GET() {
  try {
    await dbConnect();
const categories = await Category.find().sort({ priority: -1 }).lean();

    const tree = await Category.getTree();

    return successResponse("All categories loaded", { categories, tree });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to load categories");
  }
}

// ===============================
// POST — Admin Create Category
// ===============================
export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin access required", 403);

    await dbConnect();
    const body = await req.json();

    if (!body.name) {
      return validationErrorResponse({ name: "Name is required" });
    }

    const slug = await Category.generateSlug(body.name); 


    const category = await Category.create({
      name: body.name,
      slug,
      image: body.image,
      icon: body.icon,
      banner: body.banner,
      parent: body.parent ?? null,
      priority: body.priority ?? 1,
      isActive: body.isActive ?? true,
    });

    return successResponse("Category created", category, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create category");
  }
}

// ===============================
// DELETE — Delete ALL Categories (Admin Only)
// ===============================
export async function DELETE(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Admin access required", 403);

    await dbConnect();

    await Category.deleteMany();

    return successResponse("All categories deleted");
  } catch (error) {
    console.error(error);
    return errorResponse("Something went wrong");
  }
}
