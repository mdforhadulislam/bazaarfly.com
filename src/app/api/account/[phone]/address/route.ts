// src/app/api/account/[phone]/address/route.ts
// ADDRESS CRUD: GET list, POST create, GET single (via id query), PUT replace, PATCH update, DELETE

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Address } from "@/server/models/Address.model";
import { User } from "@/server/models/User.model";
import { parseUser } from "@/server/middleware/parseUser";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/server/utils/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> } // 1. Update type to Promise
) {
  try {
    await dbConnect();

    const { phone } = await params; // 2. Await params
    if (!phone) return validationErrorResponse({ phone: "phone required" });

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const address = await Address.findOne({ _id: id, user: user._id }).lean();
      if (!address) return notFoundResponse("Address not found");
      return successResponse("Address fetched", address);
    }

    const addresses = await Address.find({ user: user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return successResponse("Addresses fetched", addresses);
  } catch (err) {
    console.error("ADDRESS GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    await dbConnect();

    const { phone } = await params;
    if (!phone) return validationErrorResponse({ phone: "phone required" });

    const body = await req.json();
    const { label, address, area, city, postalCode, isDefault } = body ?? {};

    const errors: Record<string, string> = {};
    if (!label) errors.label = "label required";
    if (!address) errors.address = "address required";
    if (!area) errors.area = "area required";
    if (!city) errors.city = "city required";
    if (!postalCode) errors.postalCode = "postalCode required";
    if (Object.keys(errors).length) return validationErrorResponse(errors);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    if (isDefault) {
      await Address.updateMany(
        { user: user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const created = await Address.create({
      user: user._id,
      label,
      address,
      area,
      city,
      postalCode,
      isDefault: !!isDefault,
    });

    return successResponse("Address created", created);
  } catch (err) {
    console.error("ADDRESS POST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PUT: replace address (owner/admin) — ensures address belongs to user
 * Body: { id, payload }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    await dbConnect();

    const { phone } = await params;
    if (!phone) return validationErrorResponse({ phone: "phone required" });

    const { id, payload } = await req.json();
    if (!id || !payload)
      return validationErrorResponse({ id: "id required", payload: "payload required" });

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    // ensure ownership
    const existing = await Address.findOne({ _id: id, user: user._id }).lean();
    if (!existing) return notFoundResponse("Address not found");

    if (payload.isDefault) {
      await Address.updateMany(
        { user: user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const updated = await Address.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!updated) return notFoundResponse("Address not found");

    return successResponse("Address replaced", updated);
  } catch (err) {
    console.error("ADDRESS PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PATCH: update address (owner/admin) — ensures address belongs to user
 * Body: { id, updates }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    await dbConnect();

    const { phone } = await params;
    if (!phone) return validationErrorResponse({ phone: "phone required" });

    const { id, updates } = await req.json();
    if (!id || !updates)
      return validationErrorResponse({ id: "id required", updates: "updates required" });

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    // ensure ownership
    const existing = await Address.findOne({ _id: id, user: user._id }).lean();
    if (!existing) return notFoundResponse("Address not found");

    if (updates.isDefault) {
      await Address.updateMany(
        { user: user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const updated = await Address.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return notFoundResponse("Address not found");

    return successResponse("Address updated", updated);
  } catch (err) {
    console.error("ADDRESS PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    await dbConnect();

    const { phone } = await params;
    if (!phone) return validationErrorResponse({ phone: "phone required" });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return validationErrorResponse({ id: "id required" });

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone))
      return unauthorizedResponse();

    const user = await User.findOne({
      phoneNumber: phone,
      isDeleted: { $ne: true },
    }).lean();
    if (!user) return notFoundResponse("User not found");

    // ensure ownership
    const existing = await Address.findOne({ _id: id, user: user._id }).lean();
    if (!existing) return notFoundResponse("Address not found");

    await Address.findByIdAndDelete(id);

    return successResponse("Address deleted");
  } catch (err) {
    console.error("ADDRESS DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}