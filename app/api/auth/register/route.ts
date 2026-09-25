import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Business } from "@/models/Business";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import { Subscription } from "@/models/Subscription";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, businessName, category, phone, city } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "BUSINESS_OWNER",
      businessIds: [],
    });

    // Create initial business profile if provided
    let createdBusiness = null;
    if (businessName) {
      createdBusiness = await Business.create({
        ownerId: newUser._id,
        name: businessName,
        category: category || "General Retail",
        phone: phone || "+92 300 0000000",
        city: city || "Lahore",
        country: "Pakistan",
        currency: "PKR",
        settings: {
          deliveryFee: 250,
          freeDeliveryThreshold: 3000,
          cityDeliveryTime: "1-2 Business Days",
          nationalDeliveryTime: "3-5 Business Days",
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

      newUser.businessIds = [createdBusiness._id as mongoose.Types.ObjectId];
      newUser.defaultBusinessId = createdBusiness._id as mongoose.Types.ObjectId;
      await newUser.save();

      // Assign trial subscription
      const trialPlan = await SubscriptionPlan.findOne({ slug: "free-trial" });
      if (trialPlan) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);
        const sub = await Subscription.create({
          businessId: createdBusiness._id,
          planId: trialPlan._id,
          status: "TRIALING",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
          trialEndsAt: trialEnd,
        });
        createdBusiness.subscriptionId = sub._id as mongoose.Types.ObjectId;
        await createdBusiness.save();
      }
    }

    const sessionPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      businessId: createdBusiness ? createdBusiness._id.toString() : "",
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      business: createdBusiness,
    });

    await setSessionCookie(response, sessionPayload);
    return response;
  } catch (error: any) {
    console.error("[Register Error]", error);
    return NextResponse.json({ error: error.message || "Failed to register account." }, { status: 500 });
  }
}
