import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        parent: true,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      slug: customSlug,
      description,
      image,
      banner,
      parentId,
      position = 0,
      isActive = true,
      isFeatured = false,
      metaTitle,
      metaDescription,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = customSlug
      ? slugify(customSlug, { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const existing = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        banner,
        parentId: parentId || null,
        position: Number(position),
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        metaTitle,
        metaDescription,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Category POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, description, image, banner, parentId, position, isActive, isFeatured, isArchived, metaTitle, metaDescription } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug: slugify(slug, { lower: true, strict: true }) }),
        description,
        image,
        banner,
        parentId: parentId || null,
        ...(position !== undefined && { position: Number(position) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isArchived !== undefined && { isArchived: Boolean(isArchived) }),
        metaTitle,
        metaDescription,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Category PUT Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
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
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Category DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
