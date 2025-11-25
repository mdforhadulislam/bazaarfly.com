// Admin: get single wallet, adjust balances (PATCH) and view transactions
import { NextRequest } from "next/server";
import dbConnect from "@/components/server/config/dbConnect";
import { Wallet, TransactionType } from "@/components/server/models/Wallet.model";
import { checkAdmin } from "@/components/server/middleware/checkAdmin";
import { Notification, NotificationType } from "@/components/server/models/Notification.model";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/components/server/utils/response";
import { Types } from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");
    const { id } = params;
    const wallet = await Wallet.findById(id).lean();
    if (!wallet) return notFoundResponse("Wallet not found");
    return successResponse("Wallet fetched", wallet);
  } catch (err) {
    console.error("AFFILIATE WALLET GET ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}

// PATCH — admin adjust (credit/debit) or add transaction
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const admin = await checkAdmin(req);
    if (!admin) return unauthorizedResponse("Admin only");

    const { id } = params;
    const body = await req.json();
    const { type, amount, description, relatedId } = body ?? {};

    if (!type || !amount || !description) return validationErrorResponse({ type: "type required", amount: "amount required", description: "description required" } as any);

    const wallet = await Wallet.findById(id);
    if (!wallet) return notFoundResponse("Wallet not found");

    // addTransaction instance method handles balances
    const tx = await wallet.addTransaction(type, Number(amount), description, undefined, relatedId ? Types.ObjectId(relatedId) : undefined);

    await Notification.createNotification({
      recipient: null,
      type: NotificationType.WALLET_FUNDS_ADDED,
      title: "Wallet transaction",
      message: `Admin added ${amount} (${type}) to wallet ${wallet._id}`,
      channels: ["in_app"],
      relatedEntity: { id: wallet._id, model: "Wallet" as any },
    });

    return successResponse("Transaction added", tx);
  } catch (err) {
    console.error("AFFILIATE WALLET PATCH ERROR:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
