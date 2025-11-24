import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const verifyToken = (req: NextRequest) => {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return null;

    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { userId: string };
  } catch {
    return null;
  }
};
