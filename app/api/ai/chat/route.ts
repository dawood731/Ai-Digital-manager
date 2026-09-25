import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { AIService } from "@/services/aiService";
import { AIConversation } from "@/models/AIConversation";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message string is required." }, { status: 400 });
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

    // Find or create conversation
    let conv = null;
    if (conversationId && mongoose.isValidObjectId(conversationId)) {
      conv = await AIConversation.findOne({
        _id: conversationId,
        businessId: auth.context.businessId,
      });
    }

    if (!conv) {
      conv = await AIConversation.create({
        businessId: auth.context.businessId,
        userId: auth.context.userId,
        title: message.slice(0, 35) + "...",
        messages: [],
        mode: business.aiSettings?.mode || "APPROVAL",
      });
    }

    // Call AI Service with verified business data
    const answer = await AIService.askDigitalManager(
      auth.context.businessId,
      businessContext,
      message
    );

    // Save user message and AI response
    conv.messages.push({
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    conv.messages.push({
      role: "assistant",
      content: answer,
      createdAt: new Date(),
    });

    await conv.save();

    return NextResponse.json({
      success: true,
      answer,
      conversationId: conv._id,
      messages: conv.messages,
    });
  } catch (error: any) {
    console.error("[AI Chat Route Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
