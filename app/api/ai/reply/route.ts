import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { AIService } from "@/services/aiService";
import { ChannelManager } from "@/services/channels";

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { customerMessage, customerPhone, productId } = body;

    if (!customerMessage || typeof customerMessage !== "string") {
      return NextResponse.json({ error: "Customer message is required." }, { status: 400 });
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

    const { reply, matchedProducts } = await AIService.generateCustomerReply(
      auth.context.businessId,
      businessContext,
      customerMessage,
      productId
    );

    // Generate WhatsApp click-to-chat URL if phone is provided
    let whatsAppUrl = "";
    if (customerPhone) {
      const whatsappProvider = ChannelManager.getProvider("WHATSAPP");
      whatsAppUrl = whatsappProvider.getClickToChatUrl(customerPhone, reply);
    }

    return NextResponse.json({
      success: true,
      reply,
      matchedProducts,
      whatsAppUrl,
      aiMode: business.aiSettings?.mode || "APPROVAL",
    });
  } catch (error: any) {
    console.error("[AI Reply Route Error]", error);
    return NextResponse.json({ error: error.message || "Failed to generate reply." }, { status: 500 });
  }
}
