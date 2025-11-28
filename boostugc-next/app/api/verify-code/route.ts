import { NextResponse } from "next/server";
import { createSession, setSessionCookie, validateCode } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedCode = (code || "").trim();
    if (!normalizedEmail || !normalizedCode) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }
    const ok = validateCode(normalizedEmail, normalizedCode);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }
    const token = createSession(normalizedEmail, "none");
    await setSessionCookie(token);
    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("verify-code error", error);
    return NextResponse.json(
      { error: "Could not verify code" },
      { status: 500 }
    );
  }
}
