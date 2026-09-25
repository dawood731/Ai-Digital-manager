import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Customer } from "@/models/Customer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";
    const source = searchParams.get("source") || "";

    const query: any = { businessId: auth.context.businessId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    if (source) {
      query.source = source;
    }

    const customers = await Customer.find(query).sort({ lastInteractionAt: -1, createdAt: -1 });

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { name, phone, email, address, city, notes, tags, source } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Customer name and phone number are required." }, { status: 400 });
    }

    const newCustomer = await Customer.create({
      businessId: auth.context.businessId,
      name,
      phone,
      email,
      address,
      city: city || auth.context.business.city || "Lahore",
      notes,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      source: source || "WHATSAPP",
      totalOrders: 0,
      totalSpent: 0,
      lastInteractionAt: new Date(),
    });

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "CUSTOMER_CREATED",
      entity: "Customer",
      entityId: newCustomer._id.toString(),
      metadata: { name, phone },
    });

    return NextResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
