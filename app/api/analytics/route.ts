import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { Product } from "@/models/Product";
import { Inquiry } from "@/models/Inquiry";
import { AIService } from "@/services/aiService";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const withAiInsights = searchParams.get("aiInsights") === "true";

    const businessId = auth.context.businessId;
    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "30d") {
      startDate.setDate(now.getDate() - 30);
    } else if (range === "90d") {
      startDate.setDate(now.getDate() - 90);
    } else {
      startDate = new Date(0); // All time
    }

    // 1. Orders within range
    const orders = await Order.find({
      businessId,
      createdAt: { $gte: startDate },
    }).lean();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 2. Pending payments
    const pendingPaymentOrders = orders.filter((o) => o.paymentStatus === "PENDING" || o.paymentStatus === "PARTIAL");
    const pendingPaymentsAmount = pendingPaymentOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 3. Status distribution
    const statusDistribution: Record<string, number> = {};
    for (const o of orders) {
      statusDistribution[o.status] = (statusDistribution[o.status] || 0) + 1;
    }

    // 4. Customers & Repeat buyers
    const totalCustomers = await Customer.countDocuments({ businessId });
    const repeatCustomers = await Customer.countDocuments({ businessId, totalOrders: { $gt: 1 } });
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

    // 5. Inquiries & Conversion
    const totalInquiries = await Inquiry.countDocuments({
      businessId,
      createdAt: { $gte: startDate },
    });
    const convertedInquiries = await Inquiry.countDocuments({
      businessId,
      status: "CONVERTED",
      createdAt: { $gte: startDate },
    });
    const conversionRate = totalInquiries > 0 ? Math.round((convertedInquiries / totalInquiries) * 100) : 0;

    // 6. Top Products calculation
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const ord of orders) {
      for (const itm of ord.items || []) {
        const pId = itm.productId?.toString() || itm.name;
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = { name: itm.name, quantity: 0, revenue: 0 };
        }
        productSalesMap[pId].quantity += itm.quantity;
        productSalesMap[pId].revenue += itm.total;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const analyticsData = {
      period: range,
      currency: auth.context.business.currency || "PKR",
      totalRevenue,
      totalOrders,
      averageOrderValue,
      pendingPaymentsCount: pendingPaymentOrders.length,
      pendingPaymentsAmount,
      totalCustomers,
      repeatCustomers,
      repeatRatePercent: repeatRate,
      totalInquiries,
      convertedInquiries,
      conversionRatePercent: conversionRate,
      statusDistribution,
      topProducts,
    };

    // 7. Optional AI Insights explanation
    let aiInsights: string[] = [];
    if (withAiInsights) {
      const businessContext = {
        businessName: auth.context.business.name,
        category: auth.context.business.category,
        city: auth.context.business.city,
        currency: auth.context.business.currency,
        deliveryFee: auth.context.business.settings?.deliveryFee || 250,
        freeDeliveryThreshold: auth.context.business.settings?.freeDeliveryThreshold || 3000,
        deliveryTimes: auth.context.business.settings?.cityDeliveryTime || "1-2 days",
      };
      aiInsights = await AIService.generateInsights(businessContext, analyticsData);
    }

    return NextResponse.json({
      analytics: analyticsData,
      aiInsights,
    });
  } catch (error: any) {
    console.error("[Analytics API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
