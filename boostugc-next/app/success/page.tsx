"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const planDefaults: Record<string, { credits: number; label: string }> = {
  "free": { credits: 10, label: "Free" },
  "creator-monthly": { credits: 20, label: "Creator Monthly" },
  "creator-yearly": { credits: 240, label: "Creator Yearly" },
  "studio-monthly": { credits: 60, label: "Studio Monthly" },
  "studio-yearly": { credits: 720, label: "Studio Yearly" },
};

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const plan = params.get("plan");
    if (plan && planDefaults[plan]) {
      fetch("/api/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      }).catch(() => {});
    }
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">✅</div>
        <h1 className="text-2xl font-bold">Your subscription is active</h1>
        <p className="text-gray-200">You can now start generating images with BoostUGC.</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full rounded-full bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-600 transition"
        >
          Go to App
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
      <SuccessInner />
    </Suspense>
  );
}
