import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinaryConfig } from "./cloudinary";

const cloudinary = cloudinaryConfig();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bazaarfly/uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  } as Record<string, unknown>, // 👈 FIX HERE
});

// MULTER EXPORT
export const upload = multer({ storage });