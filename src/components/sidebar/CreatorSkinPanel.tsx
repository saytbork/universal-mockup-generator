import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const skinTones = [
  "Fair Cool",
  "Fair Warm",
  "Medium Neutral",
  "Olive",
  "Tan",
  "Deep Golden",
  "Deep Cool"
];

const skinRealismOptions = [
  "Real Raw Photo",
  "Natural Clean Retouch",
  "Beauty Editorial Soft Skin"
];

export default function CreatorSkinPanel() {
  const creator = useCreatorStore((s) => s.creator);
  const setCreatorField = useCreatorStore((s) => s.setCreatorField);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide">
        Skin
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-textSecondary text-sm">Skin Tone</span>
        <div className="grid grid-cols-2 gap-2">
          {skinTones.map((tone) => {
            const isActive = creator.skinTone === tone;

            return (
              <button
                key={tone}
                onClick={() => setCreatorField("skinTone", tone)}
                className={
                  isActive
                    ? "px-3 py-2 rounded-lg bg-accent text-white"
                    : "px-3 py-2 rounded-lg bg-surfaceTint text-textSecondary hover:bg-surfaceTint"
                }
              >
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-textSecondary text-sm">Skin Realism</span>
        <div className="grid grid-cols-1 gap-2">
          {skinRealismOptions.map((option) => {
            const isActive = creator.skinRealism === option;

            return (
              <button
                key={option}
                onClick={() => setCreatorField("skinRealism", option)}
                className={
                  isActive
                    ? "px-3 py-2 rounded-lg bg-accent text-white"
                    : "px-3 py-2 rounded-lg bg-surfaceTint text-textSecondary hover:bg-surfaceTint"
                }
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
