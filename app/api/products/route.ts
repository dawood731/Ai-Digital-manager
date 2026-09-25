import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Product } from "@/models/Product";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const query: any = { businessId: auth.context.businessId, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (lowStockOnly) {
      query.$expr = { $lte: ["$stockQuantity", "$lowStockThreshold"] };
    }

    const products = await Product.find(query).sort({ stockQuantity: 1, createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { name, sku, category, description, price, salePrice, stockQuantity, lowStockThreshold, variants, images } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Product name and price are required." }, { status: 400 });
    }

    const newProduct = await Product.create({
      businessId: auth.context.businessId,
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: category || "General",
      description,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      variants: Array.isArray(variants) ? variants : [],
      images: Array.isArray(images) ? images : [],
      isActive: true,
    });

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: newProduct._id.toString(),
      metadata: { name, sku: newProduct.sku, price },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
