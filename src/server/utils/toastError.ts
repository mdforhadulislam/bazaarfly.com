// src/utils/toastError.ts

import { toast } from "react-hot-toast";
import { handleApiError } from "./handleApiError";

export function toastApiError(error: unknown) {
  const parsed = handleApiError(error);

  toast.error(parsed.message || "Something went wrong!");
}
