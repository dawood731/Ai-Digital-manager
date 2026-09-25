import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Seed API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
