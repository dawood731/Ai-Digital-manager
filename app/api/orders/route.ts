import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { Product } from "@/models/Product";
import { AutomationEngine } from "@/services/automationEngine";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const customerId = searchParams.get("customerId") || "";

    const query: any = { businessId: auth.context.businessId };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId && mongoose.isValidObjectId(customerId)) query.customerId = customerId;

    const orders = await Order.find(query)
      .populate("customerId", "name phone city")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { customerId, items, discount = 0, deliveryFee = 0, source = "WHATSAPP", notes, deliveryAddress, city } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Customer and at least one item are required." }, { status: 400 });
    }

    const customer = await Customer.findOne({ _id: customerId, businessId: auth.context.businessId });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Calculate subtotal and build items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId: auth.context.businessId });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (product.salePrice || product.price);
      const quantity = Number(item.quantity) || 1;
      const total = unitPrice * quantity;
      subtotal += total;

      processedItems.push({
        productId: product._id,
        name: product.name,
        variantName: item.variantName,
        quantity,
        unitPrice,
        total,
      });

      // Decrement product inventory safely
      product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
      await product.save();
    }

    const finalTotal = Math.max(0, subtotal - Number(discount) + Number(deliveryFee));
    const orderNumber = `ORD-${Date.now().toString().slice(-5)}`;

    const newOrder = await Order.create({
      businessId: auth.context.businessId,
      customerId: customer._id,
      orderNumber,
      items: processedItems,
      subtotal,
      discount: Number(discount),
      deliveryFee: Number(deliveryFee),
      total: finalTotal,
      status: "NEW",
      paymentStatus: "PENDING",
      deliveryStatus: "PENDING",
      source,
      deliveryAddress: deliveryAddress || customer.address,
      city: city || customer.city || "Lahore",
      notes,
    });

    // Update customer stats
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + finalTotal;
    customer.lastInteractionAt = new Date();
    await customer.save();

    // Trigger Payment Pending Automation if applicable
    AutomationEngine.triggerEvent(auth.context.businessId, "PAYMENT_PENDING", {
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      customerId: customer._id,
      customerName: customer.name,
      total: newOrder.total,
    });

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "ORDER_CREATED",
      entity: "Order",
      entityId: newOrder._id.toString(),
      metadata: { orderNumber, total: finalTotal, customer: customer.name },
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
