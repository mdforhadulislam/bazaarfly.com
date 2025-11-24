import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "./cloudinary";

// Initialize Cloudinary
cloudinaryConfig();

// FIX: Use function for params (avoids TS errors completely)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: "bazaarfly/uploads",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
