import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { resolveCloudinaryFolder } from "./cloudinary-folders";

// ─── Singleton initialisation ─────────────────────────────────────────────────
// cloudinary.config() is idempotent once called. Re-importing this module never
// re-initialises with stale/wrong values.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
}

// Keep CLOUDINARY_FOLDERS for any legacy references
export const CLOUDINARY_FOLDERS = {
  PRODUCTS:    "cherry-jewelry/products",
  COLLECTIONS: "cherry-jewelry/collections",
  BANNERS:     "cherry-jewelry/banners",
  HOMEPAGE:    "cherry-jewelry/homepage",
  BLOG:        "cherry-jewelry/blog",
  SEO:         "cherry-jewelry/seo",
  LOGOS:       "cherry-jewelry/logos",
  FAVICON:     "cherry-jewelry/favicon",
  RINGS:       "cherry-jewelry/products/rings",
  NECKLACES:   "cherry-jewelry/products/necklaces",
  EARRINGS:    "cherry-jewelry/products/earrings",
  BRACELETS:   "cherry-jewelry/products/bracelets",
  PENDANTS:    "cherry-jewelry/products/pendants",
  BANGLES:     "cherry-jewelry/products/bangles",
  ANKLETS:     "cherry-jewelry/products/anklets",
  MANGALSUTRA: "cherry-jewelry/products/mangalsutra",
};

/**
 * Generate a signed upload signature for direct browser → Cloudinary uploads.
 * A fresh signature is generated on every call to avoid clock-drift rejections.
 */
export function generateUploadSignature(folderKey: string = "products") {
  const folder    = resolveCloudinaryFolder(folderKey);
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET || ""
  );

  return {
    timestamp,
    signature,
    apiKey:    process.env.CLOUDINARY_API_KEY    || "",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    folder,
  };
}

/**
 * Upload a Buffer or Base64 data-URI to Cloudinary (server-side only).
 */
export async function uploadToCloudinary(
  fileData: Buffer | string,
  options:  UploadOptions = {}
): Promise<UploadApiResponse> {
  const targetFolder = options.folder
    ? resolveCloudinaryFolder(options.folder)
    : CLOUDINARY_FOLDERS.PRODUCTS;

  return new Promise((resolve, reject) => {
    const params = {
      folder:        targetFolder,
      public_id:     options.publicId,
      tags:          options.tags || ["cherry-jewelry"],
      resource_type: "image" as const,
    };

    if (typeof fileData === "string" && fileData.startsWith("data:")) {
      cloudinary.uploader.upload(fileData, params, (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result);
      });
    } else if (Buffer.isBuffer(fileData)) {
      const stream = cloudinary.uploader.upload_stream(params, (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result);
      });
      stream.end(fileData);
    } else {
      reject(new Error("Invalid file data: expected Buffer or base64 data-URI"));
    }
  });
}

/** Delete a Cloudinary asset by public_id. */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary deleteFromCloudinary error:", error);
    return false;
  }
}

/**
 * List images under a folder prefix.
 * Accepts either a FolderKey or a full path.
 */
export async function listCloudinaryResources(
  folderKeyOrPath = "products",
  maxResults      = 100
) {
  const prefix = resolveCloudinaryFolder(folderKeyOrPath);
  try {
    const result = await cloudinary.api.resources({
      resource_type: "image",
      type:          "upload",
      prefix,
      max_results:   maxResults,
    });
    return result.resources as any[];
  } catch (error) {
    console.error("Cloudinary listCloudinaryResources error:", error);
    return [];
  }
}

/**
 * Inject Cloudinary transformations into an existing CDN URL.
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  width   = 800,
  quality: "auto" | "auto:good" | "auto:best" = "auto"
): string {
  if (!publicIdOrUrl) return "";
  if (!publicIdOrUrl.includes("res.cloudinary.com")) return publicIdOrUrl;
  try {
    const [base, rest] = publicIdOrUrl.split("/upload/");
    if (rest) return `${base}/upload/f_auto,q_${quality},w_${width}/${rest}`;
  } catch {
    // return original
  }
  return publicIdOrUrl;
}

export default cloudinary;
