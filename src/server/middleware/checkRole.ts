import { NextRequest } from "next/server";
import { parseUser } from "./parseUser";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "@/components/server/utils/response";

export const checkRole = async (req: NextRequest, roles: string[]) => {
  const user = await parseUser(req);
  if (!user) return unauthorizedResponse("Unauthorized");

  if (!roles.includes(user.role)) {
    return forbiddenResponse("You do not have permission");
  }

  return user;
};
