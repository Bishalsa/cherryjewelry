import { NextResponse } from "next/server";
import { listCloudinaryResources, deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "cherry-jewelry";

    const resources = await listCloudinaryResources(folder);
    return NextResponse.json({ success: true, resources });
  } catch (error: any) {
    console.error("Media List API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list media" },
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
        { success: false, error: "Public ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteFromCloudinary(publicId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Cloudinary deletion failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Media Delete API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
