import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "cherry-jewelry/products";

    const signData = generateUploadSignature(folder);

    if (!signData.apiKey || !signData.cloudName || !signData.signature) {
      return NextResponse.json(
        { success: false, error: "Cloudinary credentials missing on server" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...signData,
    });
  } catch (error: any) {
    console.error("Cloudinary Signature API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
