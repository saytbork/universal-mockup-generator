"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = params.get("email");
    if (e) setEmail(e);
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      router.push("/choose-plan");
    } catch (err: any) {
      setError(err.message || "Could not verify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-900/60 p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">BoostUGC</p>
          <h1 className="text-3xl font-bold">Enter your code</h1>
          <p className="text-sm text-gray-400">Check your email for the 6-digit code.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">6-digit code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              className="rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white tracking-[0.3em] text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
      <VerifyInner />
    </Suspense>
  );
}
