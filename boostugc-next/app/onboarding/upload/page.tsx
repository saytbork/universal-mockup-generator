"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function UploadInner() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") || "product-photo";
  const [hasFile, setHasFile] = useState(false);

  const handleStart = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Onboarding 2/2</p>
          <h1 className="text-3xl font-bold">Upload your product</h1>
          <p className="text-gray-400">Mode selected: {mode.replace("-", " ")}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-white/20 bg-gray-900/50 p-6 text-center">
          <p className="text-gray-300 mb-3">Upload File</p>
          <input
            type="file"
            className="w-full text-sm text-gray-300"
            onChange={(e) => setHasFile(Boolean(e.target.files?.length))}
          />
          <p className="text-xs text-gray-500 mt-3">Or use sample product below.</p>
          <button
            onClick={() => setHasFile(true)}
            className="mt-3 rounded-full border border-white/20 px-4 py-2 text-sm hover:border-indigo-400"
          >
            Use Sample Product
          </button>
        </div>
        <button
          onClick={handleStart}
          disabled={!hasFile}
          className="rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-50"
        >
          Start Generating
        </button>
      </div>
    </div>
  );
}

export default function OnboardingUpload() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
      <UploadInner />
    </Suspense>
  );
}
