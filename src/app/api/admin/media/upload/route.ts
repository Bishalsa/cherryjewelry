import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { resolveCloudinaryFolder } from "@/lib/cloudinary-folders";

/**
 * POST /api/admin/media/upload
 *
 * Server-side fallback upload route. Called only when the browser's direct
 * signed CDN upload fails. Uses the canonical folder resolver so the path
 * is always correct regardless of what string is passed.
 *
 * Vercel limit: 4.5 MB body. For larger files the client should use the
 * direct signed CDN upload path (Strategy A in CloudinaryImageUploader).
 */
export async function POST(req: Request) {
  try {
    const formData  = await req.formData();
    const file      = formData.get("file") as File | null;
    const folderRaw = (formData.get("folder") as string | null) || "products";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // 4.5 MB hard limit for Vercel server route
    const MAX_BYTES = 4.5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: `File too large for server route (${(file.size / 1024 / 1024).toFixed(1)} MB). Use the direct CDN upload path.` },
        { status: 413 }
      );
    }

    // Canonical folder resolution — same logic everywhere
    const targetFolder = resolveCloudinaryFolder(folderRaw);

    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    const uploadResult = await uploadToCloudinary(buffer, { folder: targetFolder });

    return NextResponse.json({
      success:  true,
      url:      uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format:   uploadResult.format,
      bytes:    uploadResult.bytes,
      width:    uploadResult.width,
      height:   uploadResult.height,
    });
  } catch (error: any) {
    console.error("[Cloudinary Upload API]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
