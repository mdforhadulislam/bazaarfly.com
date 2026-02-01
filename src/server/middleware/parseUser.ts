import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import { verifyToken } from "./verifyToken";
import { NextRequest } from "next/server";

export const parseUser = async (req: NextRequest) => {
  const decoded = verifyToken(req);
  if (!decoded) return null;

  await dbConnect();
  const user = await User.findById(decoded.userId).lean();

  return user || null;
};
