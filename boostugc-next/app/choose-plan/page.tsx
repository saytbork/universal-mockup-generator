"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  credits: number;
  watermark: boolean;
  support: string;
  stripeUrl?: string;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    cadence: "one-time",
    credits: 10,
    watermark: true,
    support: "Basic",
  },
  {
    id: "creator-monthly",
    name: "Creator",
    price: "$19",
    cadence: "per month",
    credits: 20,
    watermark: false,
    support: "Standard",
    stripeUrl: "https://buy.stripe.com/test_cNi7sK2zogyrccy5jUbV609",
  },
  {
    id: "creator-yearly",
    name: "Creator Yearly",
    price: "$137",
    cadence: "per year",
    credits: 240,
    watermark: false,
    support: "Standard",
    stripeUrl: "https://buy.stripe.com/test_4gM9ASei6dmf90mh2CbV608",
  },
  {
    id: "studio-monthly",
    name: "Studio",
    price: "$29",
    cadence: "per month",
    credits: 60,
    watermark: false,
    support: "Priority",
    stripeUrl: "https://buy.stripe.com/test_7sY5kCgqe6XR1xUbIibV602",
  },
  {
    id: "studio-yearly",
    name: "Studio Yearly",
    price: "$244",
    cadence: "per year",
    credits: 720,
    watermark: false,
    support: "Priority",
    stripeUrl: "https://buy.stripe.com/test_cNidR8a1Q6XR6Se8w6bV607",
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("free");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.email) setEmail(data.session.email);
      })
      .catch(() => {});
  }, []);

  const handleSelect = async (planId: string, stripeUrl?: string) => {
    setSelected(planId);
    if (planId === "free") {
      setLoading(true);
      await fetch("/api/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });
      setLoading(false);
      router.push("/success?plan=free");
      return;
    }
    if (stripeUrl) {
      const url = new URL(stripeUrl);
      if (email) url.searchParams.set("prefilled_email", email);
      window.location.href = url.toString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Choose Plan</p>
          <h1 className="text-3xl font-bold">Pick the right plan for your team</h1>
          <p className="text-gray-400">Free assigns 10 credits automatically. Paid plans open Stripe Checkout.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan.id, plan.stripeUrl)}
              className={`text-left rounded-2xl border p-6 bg-gray-900/60 hover:border-indigo-400 transition ${
                selected === plan.id ? "border-indigo-400 shadow-lg shadow-indigo-500/20" : "border-white/10"
              }`}
            >
              <p className="text-sm text-indigo-200 uppercase tracking-wide">{plan.name}</p>
              <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              <p className="text-sm text-gray-400">{plan.cadence}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-200">
                <li>{plan.credits} image credits</li>
                <li>{plan.watermark ? "Watermark: Yes" : "Watermark: No"}</li>
                <li>Support: {plan.support}</li>
              </ul>
              <span className="mt-4 inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
                {plan.id === "free" ? "Start Free Trial" : "Checkout with Stripe"}
              </span>
            </button>
          ))}
        </div>
        {loading && (
          <p className="text-sm text-gray-400">Activating free plan...</p>
        )}
      </div>
    </div>
  );
}
