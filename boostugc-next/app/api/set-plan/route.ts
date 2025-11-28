import { NextResponse } from "next/server";
import { setPlan } from "@/lib/auth";

const validPlans = new Set([
  "free",
  "creator-monthly",
  "creator-yearly",
  "studio-monthly",
  "studio-yearly",
]);

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    if (!validPlans.has(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const next = await setPlan(plan);
    if (!next) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true, session: next });
  } catch (error) {
    console.error("set-plan error", error);
    return NextResponse.json(
      { error: "Could not set plan" },
      { status: 500 }
    );
  }
}
