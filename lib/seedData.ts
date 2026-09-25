import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { Business } from "@/models/Business";
import { Customer } from "@/models/Customer";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Inquiry } from "@/models/Inquiry";
import { FollowUp } from "@/models/FollowUp";
import { Automation } from "@/models/Automation";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import { Subscription } from "@/models/Subscription";
import { hashPassword } from "./auth";
import mongoose from "mongoose";

export async function seedDatabase() {
  await connectToDatabase();
  console.log("[Seed] Starting database seed...");

  // 1. Subscription Plans
  await SubscriptionPlan.deleteMany({});
  const freeTrialPlan = await SubscriptionPlan.create({
    name: "Free Trial (7 Days)",
    slug: "free-trial",
    pricePKR: 0,
    interval: "trial",
    trialDays: 7,
    limits: {
      maxCustomers: 50,
      maxProducts: 25,
      maxOrdersPerMonth: 60,
      maxAiRequestsPerMonth: 150,
      maxAutomations: 3,
    },
    features: [
      "AI Digital Manager Chat",
      "WhatsApp Click-to-Chat",
      "Automated Follow-ups",
      "Basic Analytics",
      "Order & Inventory Tracking",
    ],
  });

  await SubscriptionPlan.create({
    name: "Starter Growth",
    slug: "starter",
    pricePKR: 2999,
    interval: "monthly",
    trialDays: 0,
    limits: {
      maxCustomers: 250,
      maxProducts: 100,
      maxOrdersPerMonth: 300,
      maxAiRequestsPerMonth: 800,
      maxAutomations: 10,
    },
    features: [
      "All Free Trial features",
      "Unlimited WhatsApp templates",
      "Priority Gemini AI processing",
      "Autonomous AI capabilities (with permission)",
      "Multi-channel inquiry tracker",
    ],
  });

  await SubscriptionPlan.create({
    name: "Business Pro",
    slug: "business-pro",
    pricePKR: 6999,
    interval: "monthly",
    trialDays: 0,
    limits: {
      maxCustomers: 2000,
      maxProducts: 1000,
      maxOrdersPerMonth: 3000,
      maxAiRequestsPerMonth: 5000,
      maxAutomations: 50,
    },
    features: [
      "Everything in Starter",
      "Dedicated account manager",
      "WhatsApp Cloud API integration ready",
      "Advanced predictive restocking",
      "Exportable Pakistani tax and ledger reports",
    ],
  });

  // 2. Demo Users
  await User.deleteMany({ email: { $in: ["demo@dawoodfashion.pk", "admin@aidigitalmanager.com"] } });

  const passwordHash = await hashPassword("password123");
  const adminPasswordHash = await hashPassword("admin123");

  const demoUser = await User.create({
    name: "Dawood Khan",
    email: "demo@dawoodfashion.pk",
    passwordHash,
    role: "BUSINESS_OWNER",
    businessIds: [],
  });

  const adminUser = await User.create({
    name: "System Administrator",
    email: "admin@aidigitalmanager.com",
    passwordHash: adminPasswordHash,
    role: "ADMIN",
    businessIds: [],
  });

  // 3. Demo Business "Dawood Fashion"
  await Business.deleteMany({ name: "Dawood Fashion" });

  const business = await Business.create({
    ownerId: demoUser._id,
    name: "Dawood Fashion",
    category: "Clothing & Fashion",
    phone: "+92 300 4567890",
    email: "orders@dawoodfashion.pk",
    address: "Shop 14, Liberty Market, Gulberg III",
    city: "Lahore",
    country: "Pakistan",
    currency: "PKR",
    timezone: "Asia/Karachi",
    settings: {
      deliveryFee: 250,
      freeDeliveryThreshold: 3000,
      cityDeliveryTime: "1-2 Business Days",
      nationalDeliveryTime: "3-4 Business Days",
      defaultDeliveryCompany: "Trax / CallCourier Express",
    },
    aiSettings: {
      mode: "APPROVAL",
      permissions: {
        draftFollowUps: true,
        createCustomers: true,
        createDraftOrders: true,
        updateOrderStatus: false,
        sendAutomatedFollowups: false,
        answerCustomerQuestions: true,
        sendPaymentReminders: false,
      },
    },
  });

  // Bind business to user
  demoUser.businessIds = [business._id as mongoose.Types.ObjectId];
  demoUser.defaultBusinessId = business._id as mongoose.Types.ObjectId;
  await demoUser.save();

  // Create Subscription for Business
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  const subscription = await Subscription.create({
    businessId: business._id,
    planId: freeTrialPlan._id,
    status: "TRIALING",
    currentPeriodStart: new Date(),
    currentPeriodEnd: trialEnd,
    trialEndsAt: trialEnd,
    usage: {
      customersCount: 4,
      productsCount: 5,
      ordersThisMonth: 4,
      aiRequestsThisMonth: 12,
      automationsCount: 3,
      lastResetAt: new Date(),
    },
  });

  business.subscriptionId = subscription._id as mongoose.Types.ObjectId;
  await business.save();

  // 4. Products
  await Product.deleteMany({ businessId: business._id });
  const products = await Product.create([
    {
      businessId: business._id,
      name: "Black Classic Cotton T-Shirt",
      sku: "DFT-001",
      category: "T-Shirts",
      description: "100% combed Pakistani cotton premium regular fit t-shirt with ribbed collar.",
      price: 1850,
      salePrice: 1650,
      stockQuantity: 28,
      lowStockThreshold: 5,
      variants: [
        { name: "Medium / Black", sku: "DFT-001-M", stockQuantity: 14 },
        { name: "Large / Black", sku: "DFT-001-L", stockQuantity: 10 },
        { name: "XL / Black", sku: "DFT-001-XL", stockQuantity: 4 },
      ],
      isActive: true,
    },
    {
      businessId: business._id,
      name: "Slim Fit Denim Jeans - Indigo Blue",
      sku: "DFJ-002",
      category: "Jeans",
      description: "Comfort-stretch denim with vintage wash, double-stitched durability.",
      price: 3450,
      stockQuantity: 15,
      lowStockThreshold: 4,
      variants: [
        { name: "Waist 30", sku: "DFJ-002-30", stockQuantity: 5 },
        { name: "Waist 32", sku: "DFJ-002-32", stockQuantity: 7 },
        { name: "Waist 34", sku: "DFJ-002-34", stockQuantity: 3 },
      ],
      isActive: true,
    },
    {
      businessId: business._id,
      name: "Embroidered Linen Kurta - Navy",
      sku: "DFK-003",
      category: "Traditional",
      description: "Breathable pure linen kurta with subtle hand-embroidery along the placket.",
      price: 4200,
      salePrice: 3850,
      stockQuantity: 3, // LOW STOCK!
      lowStockThreshold: 5,
      variants: [
        { name: "Medium", sku: "DFK-003-M", stockQuantity: 1 },
        { name: "Large", sku: "DFK-003-L", stockQuantity: 2 },
      ],
      isActive: true,
    },
    {
      businessId: business._id,
      name: "Oversized Fleece Hoodie - Off-White",
      sku: "DFH-004",
      category: "Winterwear",
      description: "Heavyweight 380 GSM fleece hoodie with kangaroo pocket and drop shoulders.",
      price: 3900,
      stockQuantity: 9,
      lowStockThreshold: 3,
      variants: [
        { name: "Medium", sku: "DFH-004-M", stockQuantity: 4 },
        { name: "Large", sku: "DFH-004-L", stockQuantity: 5 },
      ],
      isActive: true,
    },
    {
      businessId: business._id,
      name: "Handcrafted Leather Belt - Tan Brown",
      sku: "DFA-005",
      category: "Accessories",
      description: "Genuine full-grain cowhide leather belt with antique brass buckle.",
      price: 1450,
      stockQuantity: 2, // LOW STOCK!
      lowStockThreshold: 5,
      variants: [],
      isActive: true,
    },
  ]);

  // 5. Customers
  await Customer.deleteMany({ businessId: business._id });
  const [ali, fatima, ahmed, usman] = await Customer.create([
    {
      businessId: business._id,
      name: "Ali Raza",
      phone: "+92 321 9876543",
      email: "ali.raza.lahore@gmail.com",
      address: "House 24, Block B, DHA Phase 5",
      city: "Lahore",
      notes: "Preferred delivery time after 4 PM. Very loyal customer.",
      tags: ["VIP", "Repeat Buyer"],
      source: "WHATSAPP",
      totalOrders: 4,
      totalSpent: 14800,
      lastInteractionAt: new Date(Date.now() - 3600 * 1000 * 24 * 2),
      aiSummary: "Ali is a high-value repeat customer with 4 completed orders totaling Rs. 14,800. Fast responder on WhatsApp.",
    },
    {
      businessId: business._id,
      name: "Fatima Tariq",
      phone: "+92 333 1234567",
      email: "fatima.tariq@yahoo.com",
      address: "Flat 402, Clifton Block 4",
      city: "Karachi",
      notes: "Ordered embroidered kurta. Requested tracking update.",
      tags: ["New Customer"],
      source: "INSTAGRAM",
      totalOrders: 1,
      totalSpent: 4100,
      lastInteractionAt: new Date(Date.now() - 3600 * 1000 * 24 * 1),
      aiSummary: "Fatima made her first purchase of Rs. 4,100 via Instagram. Order was delivered 2 days ago.",
    },
    {
      businessId: business._id,
      name: "Ahmed Bilal",
      phone: "+92 301 5554321",
      email: "ahmed.bilal@outlook.com",
      address: "Street 9, Sector F-7/2",
      city: "Islamabad",
      notes: "Promised to transfer via JazzCash / Raast.",
      tags: ["Pending Payment"],
      source: "WHATSAPP",
      totalOrders: 2,
      totalSpent: 7150,
      lastInteractionAt: new Date(Date.now() - 3600 * 1000 * 18),
      aiSummary: "Ahmed has 2 orders worth Rs. 7,150. Current order ORD-1003 is awaiting payment confirmation.",
    },
    {
      businessId: business._id,
      name: "Usman Sheikh",
      phone: "+92 345 8887766",
      email: "usman.sheikh@textiles.com.pk",
      address: "Plot 89, Sundar Industrial Estate",
      city: "Lahore",
      notes: "Frequent buyer of hoodies and t-shirts in bulk.",
      tags: ["Wholesale", "VIP"],
      source: "DIRECT",
      totalOrders: 5,
      totalSpent: 28500,
      lastInteractionAt: new Date(Date.now() - 3600 * 1000 * 24 * 5),
      aiSummary: "Usman is the top customer with Rs. 28,500 in total sales across 5 completed bulk orders.",
    },
  ]);

  // 6. Orders
  await Order.deleteMany({ businessId: business._id });
  const today = new Date();
  const yesterday = new Date(Date.now() - 3600 * 1000 * 24);

  await Order.create([
    {
      businessId: business._id,
      customerId: ali._id,
      orderNumber: "ORD-1001",
      items: [
        {
          productId: products[0]._id,
          name: "Black Classic Cotton T-Shirt",
          variantName: "Medium / Black",
          quantity: 2,
          unitPrice: 1650,
          total: 3300,
        },
      ],
      subtotal: 3300,
      discount: 0,
      deliveryFee: 0, // Above free threshold
      total: 3300,
      status: "OUT_FOR_DELIVERY",
      paymentStatus: "PAID",
      deliveryStatus: "SHIPPED",
      source: "WHATSAPP",
      deliveryAddress: "House 24, Block B, DHA Phase 5, Lahore",
      city: "Lahore",
      notes: "Paid in advance via Bank Transfer (Meezan).",
      createdAt: today,
    },
    {
      businessId: business._id,
      customerId: fatima._id,
      orderNumber: "ORD-1002",
      items: [
        {
          productId: products[2]._id,
          name: "Embroidered Linen Kurta - Navy",
          variantName: "Medium",
          quantity: 1,
          unitPrice: 3850,
          total: 3850,
        },
      ],
      subtotal: 3850,
      discount: 0,
      deliveryFee: 250,
      total: 4100,
      status: "DELIVERED",
      paymentStatus: "PAID",
      deliveryStatus: "DELIVERED",
      source: "INSTAGRAM",
      deliveryAddress: "Flat 402, Clifton Block 4, Karachi",
      city: "Karachi",
      notes: "Cash on Delivery paid at doorstep.",
      createdAt: yesterday,
    },
    {
      businessId: business._id,
      customerId: ahmed._id,
      orderNumber: "ORD-1003",
      items: [
        {
          productId: products[1]._id,
          name: "Slim Fit Denim Jeans - Indigo Blue",
          variantName: "Waist 32",
          quantity: 1,
          unitPrice: 3450,
          total: 3450,
        },
      ],
      subtotal: 3450,
      discount: 0,
      deliveryFee: 250,
      total: 3700,
      status: "CONFIRMED",
      paymentStatus: "PENDING",
      deliveryStatus: "PROCESSING",
      source: "WHATSAPP",
      deliveryAddress: "Street 9, Sector F-7/2, Islamabad",
      city: "Islamabad",
      notes: "Awaiting Raast payment screenshot.",
      createdAt: today,
    },
    {
      businessId: business._id,
      customerId: usman._id,
      orderNumber: "ORD-1004",
      items: [
        {
          productId: products[3]._id,
          name: "Oversized Fleece Hoodie - Off-White",
          variantName: "Large",
          quantity: 3,
          unitPrice: 3900,
          total: 11700,
        },
      ],
      subtotal: 11700,
      discount: 700,
      deliveryFee: 0,
      total: 11000,
      status: "COMPLETED",
      paymentStatus: "PAID",
      deliveryStatus: "DELIVERED",
      source: "DIRECT",
      deliveryAddress: "Plot 89, Sundar Industrial Estate, Lahore",
      city: "Lahore",
      notes: "VIP discount applied.",
      createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 4),
    },
  ]);

  // 7. Inquiries
  await Inquiry.deleteMany({ businessId: business._id });
  await Inquiry.create([
    {
      businessId: business._id,
      customerName: "Hamza Malik",
      customerPhone: "+92 322 4443322",
      message: "Black shirt medium available hai? Lahore delivery kitne din mein hogi?",
      channel: "WHATSAPP",
      productId: products[0]._id,
      status: "NEW",
      aiSuggestedReply:
        "Salam Hamza! Haan ji, Black Classic Cotton T-Shirt medium size mein bilkul available hai. Price Rs. 1,650 hai. Lahore ke andar delivery 1-2 working days mein ho jati hai (delivery charges Rs. 250, aur Rs. 3,000 se upar free delivery hai). Kya aap order book karwana chahte hain?",
    },
    {
      businessId: business._id,
      customerName: "Ayesha Khan",
      customerPhone: "+92 312 7776655",
      message: "Slim fit jeans 32 size ka fabric stretchable hai? Price kya hai?",
      channel: "INSTAGRAM",
      productId: products[1]._id,
      status: "OPEN",
      aiSuggestedReply:
        "Salam Ayesha! Ji bilkul, Slim Fit Denim Jeans comfort-stretchable denim fabric mein hai jo pehanne mein bohot comfortable hai. Size 32 available hai aur price Rs. 3,450 hai. Delivery pure Pakistan mein available hai!",
    },
  ]);

  // 8. Follow-ups
  await FollowUp.deleteMany({ businessId: business._id });
  await FollowUp.create([
    {
      businessId: business._id,
      customerId: ahmed._id,
      type: "PENDING_PAYMENT",
      reason: "Payment pending for Order ORD-1003 (Rs. 3,700)",
      message:
        "Salam Ahmed bhai, umeed hai aap theek hain! Yeh aapke order ORD-1003 (Slim Fit Jeans - Rs. 3,700) ke hawalay se gentle reminder hai. Raast ya JazzCash payment transfer ho jaye toh screenshot share kar dein taake hum parcel dispatch kar sakein!",
      dueAt: today,
      status: "PENDING",
      channel: "WHATSAPP",
      isAiGenerated: true,
    },
    {
      businessId: business._id,
      customerId: fatima._id,
      type: "POST_DELIVERY",
      reason: "Post-delivery review for Embroidered Linen Kurta",
      message:
        "Assalam-o-Alaikum Fatima! Umeed hai aapko hamara Embroidered Linen Kurta pasand aya hoga! Fitting aur fabric kaisa laga? Hamare liye aapka review bohot zaroori hai. Shandar din guzray!",
      dueAt: today,
      status: "PENDING",
      channel: "WHATSAPP",
      isAiGenerated: true,
    },
  ]);

  // 9. Automations
  await Automation.deleteMany({ businessId: business._id });
  await Automation.create([
    {
      businessId: business._id,
      name: "Post-Delivery Customer Feedback",
      description: "Automatically schedules a friendly WhatsApp review request 2 days after parcel delivery.",
      trigger: "ORDER_DELIVERED",
      conditions: {},
      actions: [
        {
          type: "CREATE_FOLLOWUP",
          params: {
            delayDays: 2,
            followUpType: "POST_DELIVERY",
            reason: "Review & feedback request",
            template:
              "Assalam-o-Alaikum! We hope you loved your order from Dawood Fashion. How was the quality and fitting?",
          },
        },
      ],
      enabled: true,
    },
    {
      businessId: business._id,
      name: "Pending Payment Reminder",
      description: "Generates a polite payment reminder if an order remains unpaid for 24 hours.",
      trigger: "PAYMENT_PENDING",
      conditions: {},
      actions: [
        {
          type: "CREATE_FOLLOWUP",
          params: {
            delayDays: 1,
            followUpType: "PENDING_PAYMENT",
            reason: "Payment follow-up",
          },
        },
      ],
      enabled: true,
    },
    {
      businessId: business._id,
      name: "Low Stock Alert",
      description: "Alerts the business owner whenever an item's inventory drops below its low stock threshold.",
      trigger: "STOCK_LOW",
      conditions: {},
      actions: [
        {
          type: "SEND_NOTIFICATION",
          params: {
            title: "Stock Alert",
            level: "WARNING",
            message: "Item is low on stock! Restock advised to prevent missed sales.",
          },
        },
      ],
      enabled: true,
    },
    {
      businessId: business._id,
      name: "Instant AI Reply Draft for Inquiries",
      description: "Drafts an AI-generated accurate response using real catalog prices and stock for any new customer message.",
      trigger: "INQUIRY_RECEIVED",
      conditions: {},
      actions: [
        {
          type: "GENERATE_AI_REPLY",
          params: {},
        },
      ],
      enabled: true,
    },
  ]);

  console.log("[Seed] Completed successfully! Seeded demo user, business 'Dawood Fashion', products, customers, orders, inquiries, follow-ups, and automations.");
  return {
    success: true,
    demoUser: { email: "demo@dawoodfashion.pk", password: "password123" },
    adminUser: { email: "admin@aidigitalmanager.com", password: "admin123" },
    businessName: "Dawood Fashion",
  };
}
