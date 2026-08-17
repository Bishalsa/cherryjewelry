import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { razorpay } from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";
import { checkStock, reserveInventory } from "@/lib/db-queries";
import {
  getDynamicProducts,
  addDynamicOrder,
} from "@/lib/dynamic-store";
import { sampleProducts } from "@/lib/sample-data";
import type { Product } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, contactInfo, shippingAddress, paymentMethod = "razorpay", orderNotes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    if (!contactInfo?.email || !contactInfo?.phone) {
      return NextResponse.json({ success: false, error: "Contact details are required" }, { status: 400 });
    }

    // 0. Check stock availability before processing
    const stockResult = await checkStock(
      items.map((item: { productId: string; variantId?: string; quantity: number }) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      }))
    );

    if (!stockResult.available) {
      return NextResponse.json(
        {
          success: false,
          error: "Some items in your bag are currently out of stock",
          unavailableItems: stockResult.unavailableItems,
        },
        { status: 409 }
      );
    }

    // 1. Calculate subtotal and resolve products
    let subtotal = 0;
    const resolvedItems: Array<{
      productId: string;
      variantId: string | null;
      name: string;
      sku: string;
      image: string;
      price: number;
      quantity: number;
      total: number;
    }> = [];

    for (const item of items) {
      let matchedProduct: any = null;
      let matchedVariant: any = null;

      // 1a. Try DB search by id or slug
      try {
        matchedProduct = await prisma.product.findFirst({
          where: {
            OR: [{ id: item.productId }, { slug: item.productId }],
          },
          include: { variants: true, images: { orderBy: { position: "asc" } } },
        });
      } catch (dbErr) {
        console.warn("DB Product search warning during checkout:", dbErr);
      }

      // 1b. Fallback to Dynamic Store or Sample Products
      if (!matchedProduct) {
        const dynamicMatch = (getDynamicProducts() as unknown as Product[]).find(
          (p) => p.id === item.productId || p.slug === item.productId
        );
        const sampleMatch = sampleProducts.find(
          (p) => p.id === item.productId || p.slug === item.productId
        );
        const fallback = dynamicMatch || sampleMatch;

        if (fallback) {
          // If product exists in memory/fallback but not in DB, sync it to PostgreSQL
          try {
            let cat = await prisma.category.findFirst({
              where: {
                OR: [{ id: fallback.categoryId }, { slug: fallback.category?.slug || "necklaces" }],
              },
            });
            if (!cat) {
              cat = (await prisma.category.findFirst()) || (await prisma.category.create({
                data: { name: "Necklaces", slug: "necklaces", description: "Fine jewelry" },
              }));
            }

            matchedProduct = await prisma.product.create({
              data: {
                id: fallback.id.startsWith("nkc-") ? undefined : fallback.id,
                name: fallback.name,
                slug: fallback.slug,
                description: fallback.description || fallback.name,
                shortDescription: fallback.shortDescription || "",
                price: Number(fallback.price),
                compareAtPrice: fallback.compareAtPrice ? Number(fallback.compareAtPrice) : null,
                sku: fallback.sku || `CJ-${Date.now().toString().slice(-6)}`,
                material: fallback.material || "Stainless Steel",
                categoryId: cat.id,
                isActive: true,
                variants: {
                  create: {
                    name: "Standard",
                    sku: `${fallback.sku || "CJ"}-STD`,
                    price: Number(fallback.price),
                    material: fallback.material || "Stainless Steel",
                    isActive: true,
                  },
                },
              },
              include: { variants: true, images: true },
            });
          } catch (syncErr) {
            console.warn("Could not sync fallback product to DB:", syncErr);
            matchedProduct = fallback;
          }
        }
      }

      if (!matchedProduct) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      let price = Number(matchedProduct.price || 0);
      let sku = matchedProduct.sku || `SKU-${Date.now()}`;
      let name = matchedProduct.name;
      let variantId: string | null = null;

      if (matchedProduct.variants && matchedProduct.variants.length > 0) {
        if (item.variantId) {
          matchedVariant = matchedProduct.variants.find(
            (v: any) => v.id === item.variantId || v.sku === item.variantId
          );
        }
        if (!matchedVariant) {
          matchedVariant = matchedProduct.variants[0];
        }
        if (matchedVariant) {
          variantId = matchedVariant.id || null;
          if (matchedVariant.price) price = Number(matchedVariant.price);
          if (matchedVariant.sku) sku = matchedVariant.sku;
          if (matchedVariant.name && matchedVariant.name !== "Standard") {
            name = `${matchedProduct.name} - ${matchedVariant.name}`;
          }
        }
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      resolvedItems.push({
        productId: matchedProduct.id || item.productId,
        variantId,
        name,
        sku,
        image: matchedProduct.images?.[0]?.url || "/placeholder.jpg",
        price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 2. Calculate shipping and total
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    // 3. Generate unique order number
    const orderNumber = `CJ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create Order in Database (or Dynamic fallback)
    let createdOrderId = `ord-${Date.now()}`;
    let dbOrderCreated = false;

    // Try to resolve the logged-in user
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("user_session");
      if (sessionCookie?.value) {
        userId = sessionCookie.value;
      }
    } catch {
      // ignore cookie read errors
    }

    try {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          email: contactInfo.email,
          phone: contactInfo.phone,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: paymentMethod === "razorpay" ? "RAZORPAY" : "COD",
          subtotal,
          shipping,
          tax: 0,
          discount: 0,
          total,
          notes: orderNotes || null,
          shippingData: shippingAddress,
          ...(userId && { userId }),
          items: {
            create: resolvedItems.map((ri) => ({
              productId: ri.productId,
              variantId: ri.variantId,
              name: ri.name,
              sku: ri.sku,
              image: ri.image,
              price: ri.price,
              quantity: ri.quantity,
              total: ri.total,
            })),
          },
        },
      });

      createdOrderId = order.id;
      dbOrderCreated = true;
    } catch (orderDbErr) {
      console.warn("Prisma order creation warning (saving to dynamic store):", orderDbErr);
    }

    // Always mirror in dynamic store so admin orders always show it
    addDynamicOrder({
      id: createdOrderId,
      orderNumber,
      email: contactInfo.email,
      phone: contactInfo.phone,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: paymentMethod === "razorpay" ? "RAZORPAY" : "COD",
      subtotal,
      shipping,
      tax: 0,
      discount: 0,
      total,
      notes: orderNotes || null,
      shippingData: shippingAddress,
      items: resolvedItems.map((ri, i) => ({
        id: `item-${createdOrderId}-${i}`,
        productId: ri.productId,
        variantId: ri.variantId,
        name: ri.name,
        sku: ri.sku,
        image: ri.image,
        price: ri.price,
        quantity: ri.quantity,
        total: ri.total,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 4b. Reserve inventory in DB if possible
    await reserveInventory(
      items.map((item: { productId: string; variantId?: string; quantity: number }) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      }))
    );

    // 5. Handle Payment Method
    if (paymentMethod === "razorpay") {
      try {
        const amountPaise = Math.round(total * 100);
        if (amountPaise < 100) {
          return NextResponse.json(
            { success: false, error: "Order total must be at least ₹1 (100 paise)" },
            { status: 400 }
          );
        }

        const rpOrder = await razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: createdOrderId,
          notes: {
            orderNumber,
            email: contactInfo.email,
            phone: contactInfo.phone,
          },
        });

        // Save payment record in DB if DB was active
        if (dbOrderCreated) {
          try {
            await prisma.payment.create({
              data: {
                orderId: createdOrderId,
                gateway: "razorpay",
                gatewayOrderId: rpOrder.id,
                method: "RAZORPAY",
                status: "PENDING",
                amount: total,
                currency: "INR",
              },
            });
          } catch (payDbErr) {
            console.warn("Could not create DB payment row:", payDbErr);
          }
        }

        return NextResponse.json({
          success: true,
          orderId: createdOrderId,
          orderNumber,
          payment: {
            provider: "razorpay",
            id: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
          },
        });
      } catch (rpError: any) {
        console.error("Razorpay API Error:", rpError);
        if (
          rpError.statusCode === 401 ||
          rpError?.error?.code === "AUTHENTICATION_ERROR" ||
          rpError?.message?.includes("Authentication failed")
        ) {
          return NextResponse.json(
            { success: false, error: "Payment gateway credentials error (401)" },
            { status: 401 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error:
              rpError?.error?.description ||
              rpError?.message ||
              "Failed to initialize payment gateway. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // COD Flow
    return NextResponse.json({
      success: true,
      orderId: createdOrderId,
      orderNumber,
      payment: { provider: "cod" },
    });
  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error during checkout" },
      { status: 500 }
    );
  }
}
