// ADDRESS CRUD: GET list, POST create, GET single (via id query), PUT replace, PATCH update, DELETE
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Address } from "@/components/server/models/Address.model";
import { User } from "@/components/server/models/User.model";
import { parseUser } from "@/components/server/middleware/parseUser";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";

export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const id = req.nextUrl.searchParams.get("id") || null;

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const user = await User.findOne({ phoneNumber: phone }).lean();
    if (!user) return notFoundResponse("User not found");

    if (id) {
      const address = await Address.findOne({ _id: id, user: user._id }).lean();
      if (!address) return notFoundResponse("Address not found");
      return successResponse("Address fetched", address);
    }

    const addresses = await Address.find({ user: user._id }).sort({ isDefault: -1 }).lean();
    return successResponse("Addresses fetched", addresses);
  } catch (err) {
    console.error("ADDRESS GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const body = await req.json();
    const { label, address, area, city, postalCode, isDefault } = body;

    if (!label || !address || !area || !city || !postalCode) {
      return validationErrorResponse({ fields: "label,address,area,city,postalCode required" } as any);
    }

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const user = await User.findOne({ phoneNumber: phone }).lean();
    if (!user) return notFoundResponse("User not found");

    if (isDefault) {
      await Address.updateMany({ user: user._id, isDefault: true }, { isDefault: false });
    }

    const created = await Address.create({ user: user._id, label, address, area, city, postalCode, isDefault: !!isDefault });
    return successResponse("Address created", created);
  } catch (err) {
    console.error("ADDRESS POST ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const { id, payload } = await req.json();
    if (!id || !payload) return validationErrorResponse({ id: "id and payload required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const addr = await Address.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!addr) return notFoundResponse("Address not found");
    return successResponse("Address replaced", addr);
  } catch (err) {
    console.error("ADDRESS PUT ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const { id, updates } = await req.json();
    if (!id || !updates) return validationErrorResponse({ id: "id and updates required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    if (updates.isDefault) {
      const user = await User.findOne({ phoneNumber: phone }).lean();
      if (!user) return notFoundResponse("User not found");
      await Address.updateMany({ user: user._id, isDefault: true }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return notFoundResponse("Address not found");
    return successResponse("Address updated", updated);
  } catch (err) {
    console.error("ADDRESS PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await dbConnect();
    const phone = params.phone;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return validationErrorResponse({ id: "id required" } as any);

    const requester = await parseUser(req);
    const admin = await checkAdmin(req);
    if (!admin && (!requester || requester.phoneNumber !== phone)) return unauthorizedResponse();

    const deleted = await Address.findByIdAndDelete(id).lean();
    if (!deleted) return notFoundResponse("Address not found");
    return successResponse("Address deleted");
  } catch (err) {
    console.error("ADDRESS DELETE ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
