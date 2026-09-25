import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Business } from "@/models/Business";
import { Subscription } from "@/models/Subscription";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  await connectToDatabase();

  try {
    const [businesses, users, subscriptions, auditLogs] = await Promise.all([
      Business.find().populate("ownerId", "name email").sort({ createdAt: -1 }),
      User.find().select("-passwordHash").sort({ createdAt: -1 }),
      Subscription.find().populate("planId").sort({ createdAt: -1 }),
      AuditLog.find().sort({ createdAt: -1 }).limit(30),
    ]);

    return NextResponse.json({
      businesses,
      users,
      subscriptions,
      auditLogs,
      totalBusinesses: businesses.length,
      totalUsers: users.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
