import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { Contact } from "@/server/models/Contact.model";
import { checkAdmin } from "@/server/middleware/checkAdmin";
import { successResponse, errorResponse } from "@/server/utils/response";

// ----------------------
// GET — Admin view single
// ----------------------
export async function GET(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const contact = await Contact.findById(params.id);
    if (!contact) return errorResponse("Contact not found", 404);

    return successResponse("Contact fetched", contact);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// ----------------------
// PATCH — markSeen OR reply
// ----------------------
export async function PATCH(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { action, note } = body;

    if (!action) return errorResponse("Action is required", 400);

    let updated;

    // --------------------
    // mark as seen
    // --------------------
    if (action === "markSeen") {
      updated = await Contact.findByIdAndUpdate(
        params.id,
        { status: "seen" },
        { new: true }
      );
    }

    // --------------------
    // reply from admin
    // --------------------
    if (action === "reply") {
      if (!note) return errorResponse("Reply note is required", 400);

      updated = await Contact.findByIdAndUpdate(
        params.id,
        { status: "replied", adminNote: note },
        { new: true }
      );
    }

    if (!updated) return errorResponse("Contact not found", 404);

    return successResponse("Contact updated", updated);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

// ----------------------
// DELETE — soft delete or hard delete
// ----------------------
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    const admin = await checkAdmin(req);
    if (!admin) return errorResponse("Unauthorized", 401);

    const deleted = await Contact.findByIdAndDelete(params.id);

    if (!deleted) return errorResponse("Contact not found", 404);

    return successResponse("Contact deleted");
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
