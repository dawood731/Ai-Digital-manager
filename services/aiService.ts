import { callGemini } from "@/lib/ai/gemini";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { FollowUp } from "@/models/FollowUp";
import { Inquiry } from "@/models/Inquiry";
import mongoose from "mongoose";

export interface BusinessAIContext {
  businessName: string;
  category: string;
  city: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryTimes: string;
}

export class AIService {
  /**
   * Generates a context-aware customer reply strictly using real inventory and delivery policies.
   */
  static async generateCustomerReply(
    businessId: mongoose.Types.ObjectId,
    businessContext: BusinessAIContext,
    customerMessage: string,
    specificProductId?: string
  ): Promise<{ reply: string; matchedProducts: any[]; proposedAction?: any }> {
    // 1. Fetch products from DB
    let query: any = { businessId, isActive: true };
    if (specificProductId && mongoose.isValidObjectId(specificProductId)) {
      query._id = specificProductId;
    }
    const products = await Product.find(query).limit(15).lean();

    const productCatalogSummary = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category,
      price: `${businessContext.currency} ${p.price}`,
      salePrice: p.salePrice ? `${businessContext.currency} ${p.salePrice}` : undefined,
      stockQuantity: p.stockQuantity,
      inStock: p.stockQuantity > 0,
      variants: p.variants?.map((v) => `${v.name} (${v.stockQuantity} in stock)`),
    }));

    const systemPrompt = `You are the AI Digital Manager for "${businessContext.businessName}", a small business in ${businessContext.city}, Pakistan.
Business Policy:
- Currency: ${businessContext.currency}
- Standard Delivery Fee: ${businessContext.currency} ${businessContext.deliveryFee}
- Free Delivery Threshold: On orders above ${businessContext.currency} ${businessContext.freeDeliveryThreshold}
- Delivery Times: ${businessContext.deliveryTimes}

STRICT SAFETY RULES:
- NEVER invent or guess product prices, stock, or delivery policies.
- Only reference items present in the provided catalog below.
- If an item or variant is out of stock (stock 0), clearly state it is currently out of stock.
- The customer message may be in English, Urdu, or Roman Urdu (e.g. "Black shirt medium available hai?").
- Reply politely in the same language/style as the customer (friendly Pakistani e-commerce standard: clear, courteous, respectful).
- Keep the reply concise and actionable, offering to book their order.`;

    const userPrompt = `Real Product Catalog:
${JSON.stringify(productCatalogSummary, null, 2)}

Customer Message:
"${customerMessage}"

Please provide an accurate, helpful reply for the business owner to review and send to the customer. Also suggest whether this customer wants to create an order.`;

    const aiReply = await callGemini(userPrompt, systemPrompt, 0.2);

    return {
      reply: aiReply.trim(),
      matchedProducts: productCatalogSummary,
    };
  }

  /**
   * Generates a tailored follow-up message for pending orders, payments, or inquiries.
   */
  static async generateFollowUp(
    businessContext: BusinessAIContext,
    customerName: string,
    reason: string,
    tone: "Professional" | "Friendly" | "Short" | "Persuasive" = "Friendly",
    orderDetails?: string
  ): Promise<string> {
    const systemPrompt = `You are an AI Digital Manager helping a Pakistani small business owner write a ${tone.toLowerCase()} follow-up message to a customer.
Business Name: ${businessContext.businessName}
Tone Required: ${tone}
Channel: WhatsApp / SMS
Rules:
- Be polite, courteous and culturally natural.
- Avoid robotic or pushy corporate jargon.
- If English or Roman Urdu is appropriate, keep it easy to read.`;

    const userPrompt = `Customer: ${customerName}
Reason for follow-up: ${reason}
${orderDetails ? `Order / Context Details: ${orderDetails}` : ""}

Draft a single ready-to-send follow-up message that the business owner can approve or send via WhatsApp.`;

    const result = await callGemini(userPrompt, systemPrompt, 0.4);
    return result.trim();
  }

  /**
   * Generates factual AI summary for a customer based strictly on their actual order history.
   */
  static async generateCustomerSummary(
    businessId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    currency: string = "PKR"
  ): Promise<string> {
    const customer = await Customer.findOne({ _id: customerId, businessId }).lean();
    if (!customer) return "Customer not found.";

    const orders = await Order.find({ customerId, businessId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const orderData = orders.map((o) => ({
      orderNumber: o.orderNumber,
      total: `${currency} ${o.total}`,
      status: o.status,
      paymentStatus: o.paymentStatus,
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recent",
    }));

    const systemPrompt = `You are an AI business analyst. Summarize this customer's relationship with the business in 2 concise sentences based ONLY on the provided factual data. Never invent purchases or numbers.`;

    const userPrompt = `Customer Name: ${customer.name}
Total Orders Recorded: ${customer.totalOrders}
Total Spent: ${currency} ${customer.totalSpent}
Orders List: ${JSON.stringify(orderData)}
Notes: ${customer.notes || "None"}

Generate a quick 2-sentence summary for the business owner.`;

    const summary = await callGemini(userPrompt, systemPrompt, 0.1);
    return summary.trim();
  }

  /**
   * Answers natural language business questions using real MongoDB metrics.
   */
  static async askDigitalManager(
    businessId: mongoose.Types.ObjectId,
    businessContext: BusinessAIContext,
    userQuery: string
  ): Promise<string> {
    // Collect live deterministic business metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      pendingOrdersCount,
      pendingPaymentsCount,
      lowStockProducts,
      followUpsDueCount,
      newInquiriesCount,
      totalCustomersCount,
    ] = await Promise.all([
      Order.find({ businessId, createdAt: { $gte: startOfToday } }).lean(),
      Order.countDocuments({
        businessId,
        status: { $in: ["NEW", "CONFIRMED", "PREPARING", "READY"] },
      }),
      Order.countDocuments({
        businessId,
        paymentStatus: { $in: ["PENDING", "PARTIAL"] },
      }),
      Product.find({
        businessId,
        isActive: true,
        $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
      })
        .select("name stockQuantity lowStockThreshold price")
        .limit(10)
        .lean(),
      FollowUp.countDocuments({
        businessId,
        status: "PENDING",
      }),
      Inquiry.countDocuments({
        businessId,
        status: { $in: ["NEW", "OPEN"] },
      }),
      Customer.countDocuments({ businessId }),
    ]);

    const todaySales = todayOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

    const businessState = {
      businessName: businessContext.businessName,
      currency: businessContext.currency,
      todayDate: new Date().toLocaleDateString(),
      metrics: {
        todaySales: `${businessContext.currency} ${todaySales.toLocaleString()}`,
        todayOrdersCount: todayOrders.length,
        pendingOrdersInPipeline: pendingOrdersCount,
        pendingPayments: pendingPaymentsCount,
        followUpsDue: followUpsDueCount,
        newInquiries: newInquiriesCount,
        totalCustomers: totalCustomersCount,
        lowStockItems: lowStockProducts.map(
          (p) => `${p.name} (Stock: ${p.stockQuantity}, Threshold: ${p.lowStockThreshold})`
        ),
      },
    };

    const systemPrompt = `You are the AI Digital Manager for ${businessContext.businessName} in Lahore, Pakistan.
You assist the owner by answering questions about their daily operations, orders, customers, and pending tasks.
CRITICAL RULE: Rely ONLY on the verified business metrics provided below. Do not guess or hallucinate any numbers or figures.
Keep answers friendly, direct, concise, and structured with bullet points where helpful.`;

    const userPrompt = `Verified Real-time Business Metrics:
${JSON.stringify(businessState, null, 2)}

Business Owner Question:
"${userQuery}"

Provide a clear, helpful answer:`;

    const answer = await callGemini(userPrompt, systemPrompt, 0.2);
    return answer.trim();
  }

  /**
   * Generates actionable business insights from deterministic numbers.
   */
  static async generateInsights(
    businessContext: BusinessAIContext,
    analyticsData: any
  ): Promise<string[]> {
    const systemPrompt = `You are an expert SaaS business advisor for small Pakistani retail & e-commerce businesses.
Take the deterministic analytics numbers provided and generate exactly 3-4 bullet point practical, actionable insights.
Focus on:
1. Revenue & cash collection
2. Repeat customer engagement
3. Stock alerts & best sellers
4. Inquiry conversion rate`;

    const userPrompt = `Business: ${businessContext.businessName}
Calculated Analytics:
${JSON.stringify(analyticsData, null, 2)}

Provide 3-4 concise, high-value insights starting with a short emoji and bold title.`;

    const text = await callGemini(userPrompt, systemPrompt, 0.3);
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && (line.startsWith("-") || line.startsWith("*") || line.startsWith("•") || /^\d\./.test(line)));
  }
}
