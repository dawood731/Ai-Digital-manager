import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Business } from "@/models/Business";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  return NextResponse.json({
    business: auth.context.business,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { name, category, phone, email, address, city, currency, settings, aiSettings } = body;

    const business = await Business.findById(auth.context.businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    if (name) business.name = name;
    if (category) business.category = category;
    if (phone) business.phone = phone;
    if (email !== undefined) business.email = email;
    if (address !== undefined) business.address = address;
    if (city) business.city = city;
    if (currency) business.currency = currency;

    if (settings) {
      business.settings = { ...business.settings, ...settings };
    }

    if (aiSettings) {
      business.aiSettings = {
        mode: aiSettings.mode || business.aiSettings.mode,
        permissions: {
          ...business.aiSettings.permissions,
          ...(aiSettings.permissions || {}),
        },
      };
    }

    await business.save();

    await AuditLog.create({
      businessId: auth.context.businessId,
      userId: auth.context.userId,
      action: "BUSINESS_SETTINGS_UPDATED",
      entity: "Business",
      entityId: business._id.toString(),
      metadata: { aiMode: business.aiSettings.mode },
    });

    return NextResponse.json({
      success: true,
      business,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
