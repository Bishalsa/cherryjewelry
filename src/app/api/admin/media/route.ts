import { NextResponse } from "next/server";
import { listCloudinaryResources, deleteFromCloudinary } from "@/lib/cloudinary";
import { resolveCloudinaryFolder } from "@/lib/cloudinary-folders";

/**
 * GET /api/admin/media?folder=rings   (FolderKey)
 * GET /api/admin/media?folder=cherry-jewelry/products/rings  (full path)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderParam = searchParams.get("folder") || "cherry-jewelry";

    // Always resolve through canonical map before querying Cloudinary
    const folderPath = resolveCloudinaryFolder(folderParam);

    const resources = await listCloudinaryResources(folderPath);
    return NextResponse.json({ success: true, resources });
  } catch (error: any) {
    console.error("[Media List API]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list media" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "publicId is required" },
        { status: 400 }
      );
    }

    const success = await deleteFromCloudinary(publicId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Cloudinary deletion failed — asset may not exist" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Media Delete API]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
