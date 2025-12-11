import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const hairStyles = [
  "Natural Texture",
  "Loose Waves",
  "Sleek Bun",
  "Messy Updo"
];

const hairColors = [
  "Deep Brown",
  "Rich Black",
  "Warm Auburn",
  "Golden Blonde",
  "Platinum Blonde",
  "Silver / Gray",
  "Fantasy Pastel"
];

export default function CreatorAppearancePanel() {
  const creator = useCreatorStore((s) => s.creator);
  const setCreatorField = useCreatorStore((s) => s.setCreatorField);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Appearance
      </h3>

      {/* Hair Style */}
      <div className="flex flex-col gap-2">
        <span className="text-gray-300 text-sm">Hair Style</span>
        <div className="grid grid-cols-2 gap-2">
          {hairStyles.map((style) => {
            const isActive = creator.hairStyle === style;

            return (
              <button
                key={style}
                onClick={() => setCreatorField("hairStyle", style)}
                className={
                  isActive
                    ? "px-3 py-2 rounded-lg bg-indigo-500 text-white"
                    : "px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hair Color */}
      <div className="flex flex-col gap-2">
        <span className="text-gray-300 text-sm">Hair Color</span>
        <div className="grid grid-cols-2 gap-2">
          {hairColors.map((color) => {
            const isActive = creator.hairColor === color;

            return (
              <button
                key={color}
                onClick={() => setCreatorField("hairColor", color)}
                className={
                  isActive
                    ? "px-3 py-2 rounded-lg bg-indigo-500 text-white"
                    : "px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
