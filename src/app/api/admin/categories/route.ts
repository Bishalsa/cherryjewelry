import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

const DEFAULT_CATEGORIES = [
  { name: "Rings", slug: "rings", description: "Exquisite rings for every occasion", position: 1 },
  { name: "Necklaces", slug: "necklaces", description: "Stunning necklaces that captivate", position: 2 },
  { name: "Earrings", slug: "earrings", description: "Elegant earrings for every style", position: 3 },
  { name: "Bracelets", slug: "bracelets", description: "Beautiful bracelets that shine", position: 4 },
  { name: "Pendants", slug: "pendants", description: "Charming pendants & amulets", position: 5 },
  { name: "Bangles", slug: "bangles", description: "Traditional & modern bangles", position: 6 },
  { name: "Anklets", slug: "anklets", description: "Graceful anklets for women", position: 7 },
  { name: "Mangalsutra", slug: "mangalsutra", description: "Sacred mangalsutras", position: 8 },
  { name: "Solitaires", slug: "solitaires", description: "Classic solitaire jewelry", position: 9 },
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
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

    // Auto-seed standard jewelry categories if table is empty
    if (categories.length === 0) {
      try {
        await prisma.category.createMany({
          data: DEFAULT_CATEGORIES,
          skipDuplicates: true,
        });

        categories = await prisma.category.findMany({
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
      } catch (seedErr) {
        console.warn("Category auto-seed warning:", seedErr);
      }
    }

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Categories GET Error:", error);
    return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
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
