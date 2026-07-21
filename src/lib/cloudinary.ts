import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: object[];
}

export const CLOUDINARY_FOLDERS = {
  PRODUCTS: "cherry-jewelry/products",
  COLLECTIONS: "cherry-jewelry/collections",
  BANNERS: "cherry-jewelry/banners",
  HOMEPAGE: "cherry-jewelry/homepage",
  BLOG: "cherry-jewelry/blog",
  SEO: "cherry-jewelry/seo",
  LOGOS: "cherry-jewelry/logos",
  FAVICON: "cherry-jewelry/favicon",
};

/**
 * Upload a Buffer or Base64 string to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadApiResponse> {
  const targetFolder = options.folder || CLOUDINARY_FOLDERS.PRODUCTS;

  return new Promise((resolve, reject) => {
    if (typeof fileData === "string" && fileData.startsWith("data:")) {
      // Base64 upload
      cloudinary.uploader.upload(
        fileData,
        {
          folder: targetFolder,
          public_id: options.publicId,
          tags: options.tags || ["cherry-jewelry"],
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result);
        }
      );
    } else {
      // Buffer upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          public_id: options.publicId,
          tags: options.tags || ["cherry-jewelry"],
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result);
        }
      );

      if (Buffer.isBuffer(fileData)) {
        uploadStream.end(fileData);
      } else {
        reject(new Error("Invalid file format for upload"));
      }
    }
  });
}

/**
 * Delete an asset from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
}

/**
 * Get Cloudinary resources list (Media Library)
 */
export async function listCloudinaryResources(folderPrefix = "cherry-jewelry", maxResults = 100) {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPrefix,
      max_results: maxResults,
    });
    return result.resources;
  } catch (error) {
    console.error("Cloudinary List Resources Error:", error);
    return [];
  }
}

/**
 * Generate optimized Cloudinary image URL (auto format, quality, width)
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  width = 800,
  quality: "auto" | "auto:good" | "auto:best" = "auto"
): string {
  if (!publicIdOrUrl) return "";
  if (!publicIdOrUrl.includes("res.cloudinary.com")) return publicIdOrUrl;

  try {
    // If it's already a Cloudinary URL, inject transformations
    const parts = publicIdOrUrl.split("/upload/");
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_${quality},w_${width}/${parts[1]}`;
    }
  } catch {
    // Return original if parsing fails
  }

  return publicIdOrUrl;
}

export default cloudinary;
