import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { FollowUp } from "@/models/FollowUp";
import { AIService } from "@/services/aiService";
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
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    const customer = await Customer.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const [orders, followUps] = await Promise.all([
      Order.find({ customerId: customer._id, businessId: auth.context.businessId }).sort({ createdAt: -1 }),
      FollowUp.find({ customerId: customer._id, businessId: auth.context.businessId }).sort({ dueAt: -1 }),
    ]);

    return NextResponse.json({ customer, orders, followUps });
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
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    const body = await request.json();
    const customer = await Customer.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const allowedFields = ["name", "phone", "email", "address", "city", "notes", "tags", "source"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (customer as any)[field] = body[field];
      }
    }

    await customer.save();

    return NextResponse.json({ success: true, customer });
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
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    const customer = await Customer.findOneAndDelete({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "CUSTOMER_DELETED",
      entity: "Customer",
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: "Customer deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Triggers AI Customer Summary generation from factual order data.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    const customer = await Customer.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const summary = await AIService.generateCustomerSummary(
      auth.context.businessId,
      customer._id as mongoose.Types.ObjectId,
      auth.context.business.currency
    );

    customer.aiSummary = summary;
    await customer.save();

    return NextResponse.json({ success: true, summary, customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
