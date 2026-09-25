import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Automation } from "@/models/Automation";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid automation ID." }, { status: 400 });
    }

    const body = await request.json();
    const automation = await Automation.findOne({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!automation) {
      return NextResponse.json({ error: "Automation not found." }, { status: 404 });
    }

    const { name, description, trigger, conditions, actions, enabled } = body;
    if (name !== undefined) automation.name = name;
    if (description !== undefined) automation.description = description;
    if (trigger !== undefined) automation.trigger = trigger;
    if (conditions !== undefined) automation.conditions = conditions;
    if (actions !== undefined) automation.actions = actions;
    if (enabled !== undefined) automation.enabled = enabled;

    await automation.save();

    return NextResponse.json({ success: true, automation });
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
      return NextResponse.json({ error: "Invalid automation ID." }, { status: 400 });
    }

    const automation = await Automation.findOneAndDelete({
      _id: params.id,
      businessId: auth.context.businessId,
    });

    if (!automation) {
      return NextResponse.json({ error: "Automation not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Automation removed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
