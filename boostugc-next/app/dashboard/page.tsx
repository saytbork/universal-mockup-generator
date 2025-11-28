"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  email: string;
  plan: string;
  credits: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSession = async () => {
    const res = await fetch("/api/me");
    const data = await res.json();
    if (data?.authenticated) {
      setSession(data.session);
    } else {
      router.push("/signup");
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/use-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharePublic: session?.plan === "free" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to generate");
      setSession((prev) =>
        prev ? { ...prev, credits: data.credits ?? prev.credits } : prev
      );
    } catch (err: any) {
      setError(err.message || "Could not generate");
    } finally {
      setLoading(false);
    }
  };

  const creditsLow = (session?.credits ?? 0) <= 3;
  const creditsEmpty = (session?.credits ?? 0) === 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Dashboard</p>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            {session?.email && <p className="text-gray-400 text-sm">{session.email}</p>}
          </div>
          <div className="rounded-full bg-gray-900/60 border border-white/10 px-4 py-2 text-sm">
            Current plan: <span className="text-indigo-200">{session?.plan || "—"}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
            <p className="text-sm text-gray-400">Credits remaining</p>
            <p className="text-4xl font-bold mt-2">{session?.credits ?? "–"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 md:col-span-2 flex flex-col gap-3">
            <p className="text-sm text-gray-400">Create</p>
            <button
              onClick={handleGenerate}
              disabled={loading || creditsEmpty}
              className="rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-50 w-fit"
            >
              {creditsEmpty ? "No credits left" : loading ? "Generating..." : "Generate New Image"}
            </button>
            {error && (
              <p className="text-sm text-rose-300">{error}</p>
            )}
            {creditsLow && !creditsEmpty && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                You are running low on credits. Upgrade your plan for more images.
                <button
                  onClick={() => router.push("/choose-plan")}
                  className="ml-3 underline"
                >
                  Upgrade Plan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Recent images</p>
            <button
              onClick={() => router.push("/choose-plan")}
              className="text-sm text-indigo-300 hover:text-indigo-200 underline"
            >
              Upgrade Plan
            </button>
          </div>
          <p className="text-sm text-gray-400">History will appear here after you start generating.</p>
        </div>
      </div>
    </div>
  );
}
