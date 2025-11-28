import { NextResponse } from "next/server";
import { getPublicGallery } from "@/lib/gallery";

export async function GET() {
  const items = getPublicGallery().sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ items: items.slice(0, 30) });
}
