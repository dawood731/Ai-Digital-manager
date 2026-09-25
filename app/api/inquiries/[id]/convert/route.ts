import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Inquiry } from "@/models/Inquiry";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid inquiry ID." }, { status: 400 });
    }

    const inquiry = await Inquiry.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { items, deliveryAddress, city, discount = 0, deliveryFee = 250, notes } = body;

    // 1. Find or create Customer
    let customer = null;
    if (inquiry.customerId) {
      customer = await Customer.findOne({ _id: inquiry.customerId, businessId: auth.context.businessId });
    }

    if (!customer && inquiry.customerPhone) {
      customer = await Customer.findOne({
        phone: inquiry.customerPhone,
        businessId: auth.context.businessId,
      });
    }

    if (!customer) {
      customer = await Customer.create({
        businessId: auth.context.businessId,
        name: inquiry.customerName,
        phone: inquiry.customerPhone,
        address: deliveryAddress || "",
        city: city || auth.context.business.city || "Lahore",
        source: inquiry.channel,
        notes: `Converted from inquiry: "${inquiry.message.slice(0, 80)}..."`,
        tags: ["Converted from Inquiry"],
        totalOrders: 0,
        totalSpent: 0,
      });
    }

    // 2. Prepare Order Items
    let orderItems = items;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      // If no items explicitly supplied, check if inquiry had a productId
      if (inquiry.productId) {
        const product = await Product.findOne({
          _id: inquiry.productId,
          businessId: auth.context.businessId,
        });
        if (product) {
          orderItems = [
            {
              productId: product._id,
              name: product.name,
              quantity: 1,
              unitPrice: product.salePrice || product.price,
              total: product.salePrice || product.price,
            },
          ];
        }
      }
    }

    if (!orderItems || orderItems.length === 0) {
      // Customer is created/linked, but user still needs to pick products for the order
      inquiry.customerId = customer._id as mongoose.Types.ObjectId;
      await inquiry.save();
      return NextResponse.json({
        success: true,
        message: "Customer created/linked from inquiry. Select products to finalize order.",
        customer,
        inquiry,
        orderNeeded: true,
      });
    }

    // Process items and stock
    let subtotal = 0;
    const processedItems = [];

    for (const item of orderItems) {
      const product = await Product.findOne({ _id: item.productId, businessId: auth.context.businessId });
      if (!product) continue;

      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || product.salePrice || product.price;
      const lineTotal = qty * price;
      subtotal += lineTotal;

      processedItems.push({
        productId: product._id,
        name: product.name,
        variantName: item.variantName,
        quantity: qty,
        unitPrice: price,
        total: lineTotal,
      });

      product.stockQuantity = Math.max(0, product.stockQuantity - qty);
      await product.save();
    }

    const finalDeliveryFee = subtotal >= (auth.context.business.settings?.freeDeliveryThreshold || 3000) ? 0 : Number(deliveryFee);
    const finalTotal = Math.max(0, subtotal - Number(discount) + finalDeliveryFee);
    const orderNumber = `ORD-${Date.now().toString().slice(-5)}`;

    const order = await Order.create({
      businessId: auth.context.businessId,
      customerId: customer._id,
      orderNumber,
      items: processedItems,
      subtotal,
      discount: Number(discount),
      deliveryFee: finalDeliveryFee,
      total: finalTotal,
      status: "NEW",
      paymentStatus: "PENDING",
      deliveryStatus: "PENDING",
      source: inquiry.channel,
      deliveryAddress: deliveryAddress || customer.address,
      city: city || customer.city || "Lahore",
      notes: notes || `Order converted from inquiry: "${inquiry.message}"`,
    });

    // Update customer stats
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + finalTotal;
    customer.lastInteractionAt = new Date();
    await customer.save();

    // Update inquiry
    inquiry.customerId = customer._id as mongoose.Types.ObjectId;
    inquiry.status = "CONVERTED";
    inquiry.convertedOrderId = order._id as mongoose.Types.ObjectId;
    await inquiry.save();

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "INQUIRY_CONVERTED_TO_ORDER",
      entity: "Inquiry",
      entityId: inquiry._id.toString(),
      metadata: { customerId: customer._id, orderId: order._id, orderNumber },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully converted inquiry to customer and confirmed order!",
      customer,
      order,
      inquiry,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
