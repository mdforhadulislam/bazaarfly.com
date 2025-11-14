import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { User } from "@/components/server/models/User.model";
import dbConnect from "@/components/server/config/dbConnect";

export const requireAdmin = async (req: NextRequest) => {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { userId: string };

    await dbConnect();
    const user = await User.findById(decoded.userId).lean();

    if (!user || user.role !== "admin") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
};
