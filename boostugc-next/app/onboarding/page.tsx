"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const modes = [
  { id: "product-photo", title: "Product Photo" },
  { id: "ugc-lifestyle", title: "UGC Lifestyle" },
  { id: "hero-landing", title: "Hero Landing Page" },
  { id: "clean-packshot", title: "Clean Packshot" },
];

export default function OnboardingMode() {
  const router = useRouter();
  const [selected, setSelected] = useState("product-photo");

  const handleNext = () => {
    router.push(`/onboarding/upload?mode=${selected}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Onboarding 1/2</p>
          <h1 className="text-3xl font-bold">What do you want to create?</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              className={`rounded-2xl border p-4 text-left bg-gray-900/60 hover:border-indigo-400 transition ${
                selected === mode.id ? "border-indigo-400 shadow-lg shadow-indigo-500/20" : "border-white/10"
              }`}
            >
              <p className="font-semibold">{mode.title}</p>
              <p className="text-xs text-indigo-200 mt-2">Photorealistic by default</p>
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          className="rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
