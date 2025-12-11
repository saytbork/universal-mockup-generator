import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const selfieTypes = [
  "None",
  "Arm's Length Selfie"
];

export default function CreatorSelfiePanel() {
  const creator = useCreatorStore((s) => s.creator);
  const setCreatorField = useCreatorStore((s) => s.setCreatorField);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Selfie Type
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-gray-300 text-sm">Selfie Style</span>
        <div className="grid grid-cols-1 gap-2">
          {selfieTypes.map((type) => {
            const isActive = creator.selfieType === type;

            return (
              <button
                key={type}
                onClick={() => setCreatorField("selfieType", type)}
                className={
                  isActive
                    ? "px-3 py-2 rounded-lg bg-indigo-500 text-white"
                    : "px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
