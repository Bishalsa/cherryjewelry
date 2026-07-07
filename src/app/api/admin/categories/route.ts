import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Categories GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve categories" },
      { status: 500 }
    );
  }
}
