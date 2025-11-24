import { NextRequest } from "next/server"; 
import { parseUser } from "./parseUser";
import { unauthorizedResponse } from "@/components/server/utils/response";

export const auth = async (req: NextRequest) => {
  const user = await parseUser(req);
  if (!user) return unauthorizedResponse("Unauthorized");
  return user;
}; 