import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Inquiry } from "@/models/Inquiry";
import mongoose from "mongoose";

export async function GET(
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
    })
      .populate("productId")
      .populate("customerId");

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
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
      return NextResponse.json({ error: "Invalid inquiry ID." }, { status: 400 });
    }

    const body = await request.json();
    const inquiry = await Inquiry.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    const { status, aiSuggestedReply, assignedOwner } = body;
    if (status) inquiry.status = status;
    if (aiSuggestedReply !== undefined) inquiry.aiSuggestedReply = aiSuggestedReply;
    if (assignedOwner !== undefined) inquiry.assignedOwner = assignedOwner;

    await inquiry.save();

    return NextResponse.json({ success: true, inquiry });
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
      return NextResponse.json({ error: "Invalid inquiry ID." }, { status: 400 });
    }

    const inquiry = await Inquiry.findOneAndDelete({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Inquiry removed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
