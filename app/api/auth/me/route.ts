import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Business } from "@/models/Business";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let business = null;
    if (session.businessId) {
      business = await Business.findById(session.businessId);
    } else if (user.defaultBusinessId) {
      business = await Business.findById(user.defaultBusinessId);
    } else if (user.businessIds && user.businessIds.length > 0) {
      business = await Business.findById(user.businessIds[0]);
    }

    return NextResponse.json({
      authenticated: true,
      user,
      business,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
