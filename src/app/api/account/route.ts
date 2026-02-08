// =====================================================
// src/app/api/account/route.ts
// ADMIN — User Management API
// =====================================================

import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/server/utils/response";
import { checkAdmin } from "@/server/middleware/checkAdmin";

// =====================================================
// Helpers
// =====================================================
function parsePageLimit(searchParams: URLSearchParams) {
  const pageRaw = searchParams.get("page") || "1";
  const limitRaw = searchParams.get("limit") || "20";

  const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// =====================================================
// GET — Fetch ALL Users (Admin Only)
// Supports: search, role filter, pagination
// Default: excludes soft-deleted users unless ?includeDeleted=true
// =====================================================
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const sp = req.nextUrl.searchParams;

    const search = sp.get("search") || "";
    const role = sp.get("role") || "";
    const includeDeleted = (sp.get("includeDeleted") || "false") === "true";

    const { page, limit, skip } = parsePageLimit(sp);

    const query: any = {};

    // soft delete filter
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return successResponse("Users fetched", {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + users.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("ADMIN GET USERS ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// =====================================================
// PUT — Update ANY User (Admin Only)
// Fields: role, name, emailVerified, marketing, notes, etc.
// =====================================================
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const body = await req.json();
    const { userId, updates } = body ?? {};

    if (!userId || !updates) {
      return validationErrorResponse({
        userId: "userId is required",
        updates: "updates is required",
      } as Record<string, string>);
    }

    const allowedFields = [
      "name",
      "email",
      "phoneNumber",
      "role",
      "isEmailVerified",
      "hasAcceptedMarketing",
      "notes",
      "gender",
      "dateOfBirth",
      "source",
      "avatar",
      "preferences",
      "isDeleted", // optional: allow admin to set directly, but better via DELETE/PATCH
    ] as const;

    const filteredUpdates: any = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // prevent accidental hard delete fields update here (keep it safe)
    delete filteredUpdates.deletedAt;

    const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
    }).lean();

    if (!updatedUser) return notFoundResponse("User not found");

    return successResponse("User updated successfully", updatedUser);
  } catch (err: any) {
    console.error("ADMIN UPDATE USER ERROR:", err);

    // duplicate key (email/phone)
    if (err?.code === 11000) {
      return errorResponse("Duplicate email or phoneNumber", 409);
    }

    return errorResponse("Internal Server Error", 500);
  }
}

// =====================================================
// DELETE — Soft Delete ANY User (Admin Only)
// query: ?userId=
// =====================================================
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return validationErrorResponse({ userId: "userId is required" });

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!updated) return notFoundResponse("User not found");

    return successResponse("User soft deleted successfully");
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// =====================================================
// PATCH — Restore Soft Deleted User (Admin Only)
// Body: { userId }
// =====================================================
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const { userId } = await req.json();
    if (!userId) return validationErrorResponse({ userId: "userId is required" });

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        isDeleted: false,
        deletedAt: null,
      },
      { new: true }
    ).lean();

    if (!updated) return notFoundResponse("User not found");

    return successResponse("User restored successfully");
  } catch (err) {
    console.error("ADMIN RESTORE USER ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
