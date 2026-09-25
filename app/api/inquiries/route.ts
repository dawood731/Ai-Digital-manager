import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Inquiry } from "@/models/Inquiry";
import { AutomationEngine } from "@/services/automationEngine";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const channel = searchParams.get("channel") || "";

    const query: any = { businessId: auth.context.businessId };
    if (status) query.status = status;
    if (channel) query.channel = channel;

    const inquiries = await Inquiry.find(query)
      .populate("productId", "name price salePrice stockQuantity")
      .populate("customerId", "name phone totalOrders")
      .sort({ createdAt: -1 });

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { customerName, customerPhone, message, channel = "WHATSAPP", productId, customerId } = body;

    if (!customerName || !message) {
      return NextResponse.json(
        { error: "Customer name and message are required." },
        { status: 400 }
      );
    }

    const newInquiry = await Inquiry.create({
      businessId: auth.context.businessId,
      customerId: customerId || undefined,
      customerName,
      customerPhone: customerPhone || "",
      message,
      channel,
      productId: productId || undefined,
      status: "NEW",
    });

    // Trigger AI response automation if enabled
    AutomationEngine.triggerEvent(auth.context.businessId, "INQUIRY_RECEIVED", {
      inquiryId: newInquiry._id,
      customerName,
      customerPhone,
      message,
      productId,
    });

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "INQUIRY_CREATED",
      entity: "Inquiry",
      entityId: newInquiry._id.toString(),
      metadata: { customerName, channel },
    });

    return NextResponse.json({ success: true, inquiry: newInquiry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
