import { NextResponse } from "next/server";
import { checkShadowfaxServiceability } from "@/lib/shadowfax";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }

    // Indian pincodes are exactly 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ serviceable: false, error: "Invalid pincode format" });
    }

    // Bypass Shadowfax and assume all valid 6-digit pincodes are serviceable via Shiprocket manual flow
    return NextResponse.json({ success: true, serviceable: true, tat_days: 4 });
  } catch (error) {
    console.error("Serviceability API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
