import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, SessionPayload } from "./auth";
import { connectToDatabase } from "./mongodb";
import { Business, IBusiness } from "@/models/Business";
import { User, IUser } from "@/models/User";
import mongoose from "mongoose";

export interface TenantContext {
  userId: string;
  businessId: mongoose.Types.ObjectId;
  user: IUser;
  business: IBusiness;
  role: "USER" | "BUSINESS_OWNER" | "ADMIN";
}

export type TenantAuthResult =
  | { success: true; context: TenantContext }
  | { success: false; response: NextResponse };

export async function requireTenantAuth(request: NextRequest): Promise<TenantAuthResult> {
  const session = await getSessionFromRequest(request);

  if (!session || !session.userId) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  await connectToDatabase();

  const user = await User.findById(session.userId);
  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: "User account not found." }, { status: 401 }),
    };
  }

  // Derive businessId securely from session or user's default business
  let targetBusinessId: string = session.businessId;
  if (!targetBusinessId && user.defaultBusinessId) {
    targetBusinessId = user.defaultBusinessId.toString();
  } else if (!targetBusinessId && user.businessIds && user.businessIds.length > 0) {
    targetBusinessId = user.businessIds[0].toString();
  }

  if (!targetBusinessId) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "No business associated with this account. Please complete onboarding.", needsOnboarding: true },
        { status: 403 }
      ),
    };
  }

  // Verify that the user actually owns or is assigned to this business
  const isAuthorizedBusiness =
    user.role === "ADMIN" ||
    user.businessIds.some((bId) => bId.toString() === targetBusinessId);

  if (!isAuthorizedBusiness) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden: Access to this business is not permitted." },
        { status: 403 }
      ),
    };
  }

  const business = await Business.findById(targetBusinessId);
  if (!business) {
    return {
      success: false,
      response: NextResponse.json({ error: "Business profile not found." }, { status: 404 }),
    };
  }

  return {
    success: true,
    context: {
      userId: user._id.toString(),
      businessId: business._id as mongoose.Types.ObjectId,
      user,
      business,
      role: user.role,
    },
  };
}
