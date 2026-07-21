import { NextResponse } from "next/server";
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderType = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Map folder string to CLOUDINARY_FOLDERS namespace
    let targetFolder = CLOUDINARY_FOLDERS.PRODUCTS;
    if (folderType === "collections") targetFolder = CLOUDINARY_FOLDERS.COLLECTIONS;
    else if (folderType === "banners") targetFolder = CLOUDINARY_FOLDERS.BANNERS;
    else if (folderType === "homepage") targetFolder = CLOUDINARY_FOLDERS.HOMEPAGE;
    else if (folderType === "blog") targetFolder = CLOUDINARY_FOLDERS.BLOG;
    else if (folderType === "seo") targetFolder = CLOUDINARY_FOLDERS.SEO;
    else if (folderType === "logos") targetFolder = CLOUDINARY_FOLDERS.LOGOS;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: targetFolder,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error: any) {
    console.error("Cloudinary Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
