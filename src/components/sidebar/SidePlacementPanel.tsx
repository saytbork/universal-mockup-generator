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
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Side Placement
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {sides.map((side) => {
          const isActive = sidePlacement === side.value;

          return (
            <button
              key={side.value}
              onClick={() => setSidePlacement(side.value)}
              className={
                isActive
                  ? "px-4 py-2 rounded-lg text-center bg-indigo-500 text-white"
                  : "px-4 py-2 rounded-lg text-center bg-gray-700 text-gray-300 hover:bg-gray-600"
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
