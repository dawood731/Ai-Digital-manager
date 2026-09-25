import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Product } from "@/models/Product";
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
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const product = await Product.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
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
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const body = await request.json();
    const product = await Product.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const fields = [
      "name",
      "sku",
      "category",
      "description",
      "price",
      "salePrice",
      "stockQuantity",
      "lowStockThreshold",
      "variants",
      "images",
      "isActive",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        (product as any)[field] = body[field];
      }
    }

    await product.save();

    // Check if stock is low to trigger automation
    if (product.stockQuantity <= product.lowStockThreshold) {
      AutomationEngine.triggerEvent(auth.context.businessId, "STOCK_LOW", {
        productId: product._id,
        itemName: product.name,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
      });
    }

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "PRODUCT_UPDATED",
      entity: "Product",
      entityId: params.id,
      metadata: { stockQuantity: product.stockQuantity, price: product.price },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const product = await Product.findOneAndUpdate(
      { _id: params.id, businessId: auth.context.businessId },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product archived successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
