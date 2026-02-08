import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/server/config/dbConnect";
import { User } from "@/server/models/User.model";
import { successResponse, errorResponse } from "@/server/utils/response";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("access_token")?.value;
    if (!token) return errorResponse("Unauthorized", 401);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) return errorResponse("Unauthorized", 401);

    return successResponse("OK", {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    return errorResponse("Unauthorized", 401);
  }
}
