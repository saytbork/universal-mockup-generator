import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const modes = [
  "Standard UGC",
  "Cinematic UGC",
  "Ecommerce Blank Space",
  "Lifestyle UGC",
  "Studio Hero",
  "Aesthetic Builder",
  "Background Replace"
];

export default function CreationModePanel() {
  const creationMode = useCreatorStore((s) => s.creationMode);
  const setCreationMode = useCreatorStore((s) => s.setCreationMode);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Creation Mode
      </h3>

      <div className="grid grid-cols-1 gap-2">
        {modes.map((label) => {
          const value = label.toLowerCase().replace(/\s+/g, "-");
          const isActive = creationMode === value;

          return (
            <button
              key={value}
              onClick={() => setCreationMode(value)}
              className={
                isActive
                  ? "px-4 py-2 rounded-lg text-left bg-accent text-white"
                  : "px-4 py-2 rounded-lg text-left bg-whiteTint text-gray-600 hover:bg-whiteTint"
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
