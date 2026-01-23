import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const eyeColors = [
  "Brown",
  "Hazel",
  "Green",
  "Blue",
  "Gray",
  "Dark Amber"
];

export default function CreatorEyesPanel() {
  const creator = useCreatorStore((s) => s.creator);
  const setCreatorField = useCreatorStore((s) => s.setCreatorField);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Eyes
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-gray-600 text-sm">Eye Color</span>
        <div className="grid grid-cols-2 gap-2">
          {eyeColors.map((color) => {
            const isActive = creator.eyeColor === color;

            return (
              <button
                key={color}
                onClick={() => setCreatorField("eyeColor", color)}
                className={
                  isActive
                    ? "px-3 py-2 rounded-lg bg-indigo-600 text-white"
                    : "px-3 py-2 rounded-lg bg-whiteTint text-gray-600 hover:bg-whiteTint"
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
