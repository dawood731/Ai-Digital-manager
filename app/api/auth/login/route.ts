import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Business } from "@/models/Business";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Determine target business
    let targetBusiness = null;
    if (user.defaultBusinessId) {
      targetBusiness = await Business.findById(user.defaultBusinessId);
    } else if (user.businessIds && user.businessIds.length > 0) {
      targetBusiness = await Business.findById(user.businessIds[0]);
    }

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: targetBusiness ? targetBusiness._id.toString() : "",
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: targetBusiness,
    });

    await setSessionCookie(response, sessionPayload);
    return response;
  } catch (error: any) {
    console.error("[Login Error]", error);
    return NextResponse.json({ error: error.message || "Login failed." }, { status: 500 });
  }
}
