import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { FollowUp } from "@/models/FollowUp";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid follow-up ID." }, { status: 400 });
    }

    const body = await request.json();
    const followUp = await FollowUp.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!followUp) {
      return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
    }

    const { status, message, dueAt } = body;
    if (status) {
      followUp.status = status;
      if (status === "COMPLETED" || status === "SENT") {
        followUp.completedAt = new Date();
      }
    }
    if (message !== undefined) followUp.message = message;
    if (dueAt !== undefined) followUp.dueAt = new Date(dueAt);

    await followUp.save();

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "FOLLOWUP_UPDATED",
      entity: "FollowUp",
      entityId: params.id,
      metadata: { status: followUp.status },
    });

    return NextResponse.json({ success: true, followUp });
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
      return NextResponse.json({ error: "Invalid follow-up ID." }, { status: 400 });
    }

    const followUp = await FollowUp.findOneAndDelete({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!followUp) {
      return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Follow-up deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
