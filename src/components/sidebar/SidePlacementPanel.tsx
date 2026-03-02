import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const sides = [
  { label: "Left Side", value: "left" },
  { label: "Right Side", value: "right" }
];

export default function SidePlacementPanel() {
  const sidePlacement = useCreatorStore((s) => s.sidePlacement);
  const setSidePlacement = useCreatorStore((s) => s.setSidePlacement);

  return (
    <div className="flex flex-col gap-4">
  <h3 className="text-sm text-gray-600 uppercase tracking-wide">
        Side Placement
      </h3>

      <div className="flex flex-wrap gap-2">
        {sides.map((side) => {
          const isActive = sidePlacement === side.value;

          return (
            <button
              key={side.value}
              onClick={() => setSidePlacement(side.value)}
              className={
                isActive
                  ? "px-4 py-2 rounded-lg text-center bg-indigo-600 text-white"
                  : "px-4 py-2 rounded-lg text-center bg-whiteTint text-gray-600 hover:bg-whiteTint"
              }
            >
              {side.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
