import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

export default function EcommerceBlankSettings() {
  const bgColor = useCreatorStore((s) => s.bgColor);
  const setBgColor = useCreatorStore((s) => s.setBgColor);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Ecommerce Blank Space
      </h3>

      <label className="flex flex-col gap-2 text-gray-600">
        <span className="text-sm">Background Color</span>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-16 h-10 rounded-md bg-white border border-gray-200 cursor-pointer"
        />
      </label>
    </div>
  );
}
