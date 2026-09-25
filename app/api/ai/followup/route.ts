import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { AIService } from "@/services/aiService";
import { ChannelManager } from "@/services/channels";

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { customerName, customerPhone, reason, tone = "Friendly", orderDetails } = body;

    if (!customerName || !reason) {
      return NextResponse.json({ error: "Customer name and reason are required." }, { status: 400 });
    }

    const business = auth.context.business;
    const businessContext = {
      businessName: business.name,
      category: business.category,
      city: business.city || "Lahore",
      currency: business.currency || "PKR",
      deliveryFee: business.settings?.deliveryFee || 250,
      freeDeliveryThreshold: business.settings?.freeDeliveryThreshold || 3000,
      deliveryTimes: business.settings?.cityDeliveryTime || "1-2 Business Days",
    };

    const message = await AIService.generateFollowUp(
      businessContext,
      customerName,
      reason,
      tone,
      orderDetails
    );

    let whatsAppUrl = "";
    if (customerPhone) {
      const whatsappProvider = ChannelManager.getProvider("WHATSAPP");
      whatsAppUrl = whatsappProvider.getClickToChatUrl(customerPhone, message);
    }

    return NextResponse.json({
      success: true,
      message,
      whatsAppUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
