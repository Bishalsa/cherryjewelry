import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

async function getAuthUserId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session");
  return sessionCookie?.value || null;
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, firstName, lastName, addressLine1, addressLine2, city, state, pincode, country, phone, isDefault } = body;

    if (!firstName || !lastName || !addressLine1 || !city || !state || !pincode || !phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // If marked default, unset other default addresses for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || "Home",
        firstName,
        lastName,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        pincode,
        country: country || "India",
        phone,
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Address POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create address" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, label, firstName, lastName, addressLine1, addressLine2, city, state, pincode, country, phone, isDefault } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing address ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized or not found" }, { status: 403 });
    }

    // If marked default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label,
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
        phone,
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Address PUT Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing address ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized or not found" }, { status: 403 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
