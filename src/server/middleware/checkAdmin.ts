import { NextRequest } from "next/server"; 
import { parseUser } from "./parseUser";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "@/server/utils/response";

export const checkAdmin = async (req: NextRequest) => {
  const user = await parseUser(req);
  if (!user) return unauthorizedResponse("Unauthorized");

  if (user.role !== "admin") {
    return forbiddenResponse("Admin access required");
  }

  return user;
};
