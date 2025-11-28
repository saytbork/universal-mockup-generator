"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not send code");
      }
      router.push(`/verify-code?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-900/60 p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">BoostUGC</p>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-400">Passwordless: we email you a 6-digit access code.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@brand.com"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Send Access Code"}
          </button>
        </form>
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}
        <p className="text-xs text-gray-500">
          Already have a code?{" "}
          <button
            onClick={() => router.push("/verify-code")}
            className="text-indigo-300 hover:text-indigo-200 underline"
          >
            Verify code
          </button>
        </p>
      </div>
    </div>
  );
}
