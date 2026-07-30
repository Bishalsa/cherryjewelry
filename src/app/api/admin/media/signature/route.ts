import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";

/**
 * GET /api/admin/media/signature?folder=rings
 *
 * Returns a fresh, time-stamped Cloudinary upload signature.
 * The signature is valid for ~60 min (Cloudinary default window).
 * Called once per file by CloudinaryImageUploader before direct CDN upload.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Accept either a FolderKey ("rings") or a full path ("cherry-jewelry/products/rings")
    const folderParam = searchParams.get("folder") || "products";

    const signData = generateUploadSignature(folderParam);

    if (!signData.apiKey || !signData.cloudName || !signData.signature) {
      return NextResponse.json(
        { success: false, error: "Cloudinary server credentials are not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ...signData });
  } catch (error: any) {
    console.error("[Cloudinary Signature API]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
