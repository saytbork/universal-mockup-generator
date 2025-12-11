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
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Eyes
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-gray-300 text-sm">Eye Color</span>
        <div className="grid grid-cols-2 gap-2">
          {eyeColors.map((color) => {
            const isActive = creator.eyeColor === color;

            return (
              <button
                key={color}
                onClick={() => setCreatorField("eyeColor", color)}
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
