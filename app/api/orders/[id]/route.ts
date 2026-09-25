import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { AutomationEngine } from "@/services/automationEngine";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    }).populate("customerId", "name phone email address city");

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
    }

    const body = await request.json();
    const order = await Order.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const previousStatus = order.status;
    const { status, paymentStatus, deliveryStatus, notes, deliveryAddress } = body;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (notes !== undefined) order.notes = notes;
    if (deliveryAddress !== undefined) order.deliveryAddress = deliveryAddress;

    await order.save();

    // Trigger Order Delivered Automation if order just changed to DELIVERED
    if (status === "DELIVERED" && previousStatus !== "DELIVERED") {
      const customer = await Customer.findById(order.customerId);
      AutomationEngine.triggerEvent(auth.context.businessId, "ORDER_DELIVERED", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: customer?.name || "Valued Customer",
        customerPhone: customer?.phone,
      });
    }

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "ORDER_STATUS_UPDATED",
      entity: "Order",
      entityId: params.id,
      metadata: { previousStatus, newStatus: order.status, paymentStatus: order.paymentStatus },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
