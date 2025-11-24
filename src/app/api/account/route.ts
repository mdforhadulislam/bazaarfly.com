// =====================================================
// src/app/api/account/route.ts
// ADMIN — User Management API
// =====================================================

import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { User } from "@/components/server/models/User.model";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";

// =====================================================
// GET — Fetch ALL Users (Admin Only)
// Supports: search, role filter, pagination
// =====================================================

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const { search, role, page = "1", limit = "20" } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const query: any = {};

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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    return successResponse("Users fetched", {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
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
    const { userId, updates } = body;

    if (!userId || !updates) {
      return errorResponse("userId and updates are required", 400);
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
    ];

    const filteredUpdates: any = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
    }).lean();

    if (!updatedUser) return notFoundResponse("User not found");

    return successResponse("User updated successfully", updatedUser);
  } catch (err) {
    console.error("ADMIN UPDATE USER ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// =====================================================
// DELETE — Soft Delete ANY User (Admin Only)
// =====================================================

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) return errorResponse("userId is required", 400);

    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    return successResponse("User soft deleted successfully");
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// =====================================================
// PATCH — Restore Soft Deleted User (Admin Only)
// =====================================================

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin access required");

    const { userId } = await req.json();
    if (!userId) return errorResponse("userId is required", 400);

    await User.findByIdAndUpdate(userId, {
      isDeleted: false,
      deletedAt: null,
    });

    return successResponse("User restored successfully");
  } catch (err) {
    console.error("ADMIN RESTORE USER ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
