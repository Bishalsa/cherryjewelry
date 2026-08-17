import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getDynamicOrders } from "@/lib/dynamic-store";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: true, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
      include: {
        addresses: {
          orderBy: { isDefault: "desc" },
        },
      },
    });

    if (!user) {
      // Session cookie is invalid, clear it
      cookieStore.set("user_session", "", { path: "/", maxAge: 0 });
      return NextResponse.json({ success: true, user: null });
    }

    // Fetch orders by userId OR by user's email (for guest checkout orders)
    let dbOrders: any[] = [];
    try {
      dbOrders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email },
          ],
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (dbErr) {
      console.warn("Failed to fetch orders from DB:", dbErr);
    }

    // Also merge dynamic orders matching user's email
    const dynamicOrders = getDynamicOrders();
    const dynamicMatching = dynamicOrders.filter(
      (o) => o.email.toLowerCase() === user.email.toLowerCase()
    );

    // Deduplicate by orderNumber
    const orderMap = new Map<string, any>();
    for (const o of dbOrders) {
      orderMap.set(o.orderNumber || o.id, o);
    }
    for (const o of dynamicMatching) {
      if (!orderMap.has(o.orderNumber) && !orderMap.has(o.id)) {
        orderMap.set(o.orderNumber || o.id, o);
      }
    }

    const mergedOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        orders: mergedOrders,
      },
    });
  } catch (error) {
    console.error("Auth GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user session" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, name, phone } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    if (action === "login") {
      const user = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "No account found with this email. Please create an account first." },
          { status: 404 }
        );
      }

      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set("user_session", user.id, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, user });
    } 
    
    if (action === "register") {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Name is required for registration" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      // Generate mock supabaseId to comply with schema validation constraints
      const mockSupabaseId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const user = await prisma.user.create({
        data: {
          supabaseId: mockSupabaseId,
          email: emailLower,
          name: name.trim(),
          phone: phone ? phone.trim() : null,
          role: "CUSTOMER",
          isActive: true,
        },
      });

      // Set session cookie (auto-login after registration)
      const cookieStore = await cookies();
      cookieStore.set("user_session", user.id, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Auth POST API Error:", error);

    // Handle Prisma unique constraint violations
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("user_session", "", {
      path: "/",
      maxAge: 0,
    });
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Auth DELETE API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
