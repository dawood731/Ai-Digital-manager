import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/tenant";
import { Subscription } from "@/models/Subscription";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import { Customer } from "@/models/Customer";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Automation } from "@/models/Automation";

export async function GET(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const businessId = auth.context.businessId;

    const [subscription, plans, customersCount, productsCount, ordersCount, automationsCount] =
      await Promise.all([
        Subscription.findOne({ businessId }).populate("planId"),
        SubscriptionPlan.find({ isActive: true }).sort({ pricePKR: 1 }),
        Customer.countDocuments({ businessId }),
        Product.countDocuments({ businessId, isActive: true }),
        Order.countDocuments({ businessId }),
        Automation.countDocuments({ businessId, enabled: true }),
      ]);

    const currentUsage = {
      customers: customersCount,
      products: productsCount,
      orders: ordersCount,
      automations: automationsCount,
    };

    return NextResponse.json({
      subscription,
      availablePlans: plans,
      currentUsage,
      currency: auth.context.business.currency || "PKR",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireTenantAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { planSlug } = body;

    const targetPlan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
    if (!targetPlan) {
      return NextResponse.json({ error: "Selected plan not found." }, { status: 404 });
    }

    const businessId = auth.context.businessId;
    let subscription = await Subscription.findOne({ businessId });

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (!subscription) {
      subscription = await Subscription.create({
        businessId,
        planId: targetPlan._id,
        status: targetPlan.interval === "trial" ? "TRIALING" : "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      });
    } else {
      subscription.planId = targetPlan._id;
      subscription.status = "ACTIVE";
      subscription.currentPeriodEnd = periodEnd;
      await subscription.save();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${targetPlan.name}!`,
      subscription,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
