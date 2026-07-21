import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isApproved } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
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
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
