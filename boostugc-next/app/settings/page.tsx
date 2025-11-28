"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  email: string;
  plan: string;
  credits: number;
};

export default function SettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) setSession(data.session);
        else router.push("/signup");
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Settings</p>
          <h1 className="text-3xl font-bold">Manage subscription</h1>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-3">
          <p className="text-sm text-gray-400">Current plan</p>
          <p className="text-xl font-semibold">{session?.plan || "—"}</p>
          <p className="text-sm text-gray-300">Credits left: {session?.credits ?? "—"}</p>
          <p className="text-sm text-gray-500">Renewal date: via Stripe (configure success/portal URLs)</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => router.push("/choose-plan")}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
            >
              Change Plan
            </button>
            <button
              onClick={() => alert("Connect Stripe customer portal for full cancel flow.")}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-indigo-400 transition"
            >
              Cancel Subscription
            </button>
            <button
              onClick={() => alert("Connect Stripe customer portal to view invoices.")}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-indigo-400 transition"
            >
              View Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
