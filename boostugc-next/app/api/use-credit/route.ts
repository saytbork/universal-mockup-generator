import { NextResponse } from "next/server";
import { consumeCredit, getSession } from "@/lib/auth";
import { addGalleryItem } from "@/lib/gallery";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const sharePublic = Boolean(body?.sharePublic);
  const result = await consumeCredit(sharePublic);
  if (!result.ok || !result.session) {
    return NextResponse.json(
      { error: result.error || "Unable to consume credit" },
      { status: result.error === "No credits left" ? 400 : 401 }
    );
  }
  const imgId = `img-${Math.random().toString(36).slice(2, 9)}`;
  if (sharePublic || result.session.publicDefault) {
    addGalleryItem({
      id: imgId,
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      title: "Generated with BoostUGC",
      createdAt: Date.now(),
      public: true,
      plan: result.session.plan,
    });
  }
  return NextResponse.json({
    ok: true,
    credits: result.session.credits,
  });
}
