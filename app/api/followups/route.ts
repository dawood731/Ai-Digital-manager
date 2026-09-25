import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { FollowUp } from "@/models/FollowUp";
import { Customer } from "@/models/Customer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const dueToday = searchParams.get("dueToday") === "true";

    const query: any = { businessId: auth.context.businessId };
    if (status) query.status = status;
    if (type) query.type = type;

    if (dueToday) {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      query.dueAt = { $lte: endOfToday };
      query.status = "PENDING";
    }

    const followUps = await FollowUp.find(query)
      .populate("customerId", "name phone email city")
      .populate("orderId", "orderNumber total status")
      .sort({ dueAt: 1, createdAt: -1 });

    return NextResponse.json({ followUps });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { customerId, orderId, inquiryId, type = "CUSTOM", reason, message, dueAt, channel = "WHATSAPP" } = body;

    if (!customerId || !reason || !message) {
      return NextResponse.json(
        { error: "Customer, reason, and message are required." },
        { status: 400 }
      );
    }

    const customer = await Customer.findOne({ _id: customerId, businessId: auth.context.businessId });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const newFollowUp = await FollowUp.create({
      businessId: auth.context.businessId,
      customerId: customer._id,
      orderId: orderId || undefined,
      inquiryId: inquiryId || undefined,
      type,
      reason,
      message,
      dueAt: dueAt ? new Date(dueAt) : new Date(),
      status: "PENDING",
      channel,
      isAiGenerated: false,
    });

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "FOLLOWUP_CREATED",
      entity: "FollowUp",
      entityId: newFollowUp._id.toString(),
      metadata: { reason, customer: customer.name },
    });

    return NextResponse.json({ success: true, followUp: newFollowUp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
