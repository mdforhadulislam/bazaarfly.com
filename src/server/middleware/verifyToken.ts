import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

type JwtPayload = { userId: string };

export const verifyToken = (req: NextRequest): JwtPayload | null => {
  try {
    // ✅ your cookie name is: access_token
    const token = req.cookies.get("access_token")?.value;

    if (!token) return null;

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
  } catch (err) {
    return null;
  }
};
