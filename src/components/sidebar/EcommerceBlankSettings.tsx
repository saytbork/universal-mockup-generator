import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

export default function EcommerceBlankSettings() {
  const bgColor = useCreatorStore((s) => s.bgColor);
  const setBgColor = useCreatorStore((s) => s.setBgColor);

  return (
    <div className="flex flex-col gap-4">
  <h3 className="text-sm text-gray-600 uppercase tracking-wide">
        Ecommerce Blank Space
      </h3>

      <label className="flex flex-col gap-2 text-gray-600">
        <span className="text-sm">Background Color</span>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-full border border-gray-200 bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 hover:border-gray-300"
        />
      </label>
    </div>
  );
}
