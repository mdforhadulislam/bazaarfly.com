import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Contact } from "@/server/models/Contact.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/server/utils/response";

// ---------------------------
// PUBLIC — Submit Contact Form
// ---------------------------
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return errorResponse("Name, email & message are required", 400);
    }

    const created = await Contact.create({
      name,
      email,
      phone: phone || "",
      message,
    });

    return successResponse("Message submitted successfully", created, 201);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// ---------------------------
// ADMIN — GET ALL CONTACTS
// ?page=1&limit=20&status=pending
// ---------------------------
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status) filter.status = status;

    const total = await Contact.countDocuments(filter);

    const data = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return paginatedResponse("Contacts fetched", data, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
