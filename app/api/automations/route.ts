import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Automation } from "@/models/Automation";
import { AutomationExecution } from "@/models/AutomationExecution";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const [automations, recentExecutions] = await Promise.all([
      Automation.find({ businessId: auth.context.businessId }).sort({ createdAt: -1 }),
      AutomationExecution.find({ businessId: auth.context.businessId })
        .sort({ executedAt: -1 })
        .limit(20),
    ]);

    return NextResponse.json({ automations, recentExecutions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { name, description, trigger, conditions = {}, actions = [], enabled = true } = body;

    if (!name || !trigger || !actions || actions.length === 0) {
      return NextResponse.json(
        { error: "Name, trigger, and at least one action are required." },
        { status: 400 }
      );
    }

    const newAutomation = await Automation.create({
      businessId: auth.context.businessId,
      name,
      description,
      trigger,
      conditions,
      actions,
      enabled,
    });

    return NextResponse.json({ success: true, automation: newAutomation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
