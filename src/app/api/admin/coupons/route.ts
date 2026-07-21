import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, description, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, isActive } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required coupon fields" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || "",
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 365 * 86400000),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, code, description, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase().trim() }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value !== undefined && { value: Number(value) }),
        ...(minOrderAmount !== undefined && { minOrderAmount: Number(minOrderAmount) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? Number(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
