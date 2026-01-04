import React from "react";
import { useCreatorStore } from "../../store/useCreatorStore";

const presets = [
  "Custom Build",
  "Beauty Creator",
  "Wellness Coach",
  "Streetwear Reviewer",
  "Everyday Hustler",
  "Fitness Creator"
];

// Simple preset definitions for now.
// Can be expanded later.
const presetValues = {
  "Beauty Creator": {
    hairStyle: "Loose Waves",
    hairColor: "Golden Blonde",
    skinTone: "Fair Warm",
    skinRealism: "Natural Clean Retouch",
    eyeColor: "Hazel",
    selfieType: "Arm's Length Selfie"
  },
  "Wellness Coach": {
    hairStyle: "Natural Texture",
    hairColor: "Rich Black",
    skinTone: "Medium Neutral",
    skinRealism: "Real Raw Photo",
    eyeColor: "Brown",
    selfieType: "None"
  },
  "Streetwear Reviewer": {
    hairStyle: "Messy Updo",
    hairColor: "Deep Brown",
    skinTone: "Olive",
    skinRealism: "Natural Clean Retouch",
    eyeColor: "Green",
    selfieType: "Arm's Length Selfie"
  },
  "Everyday Hustler": {
    hairStyle: "Sleek Bun",
    hairColor: "Silver / Gray",
    skinTone: "Tan",
    skinRealism: "Beauty Editorial Soft Skin",
    eyeColor: "Gray",
    selfieType: "None"
  },
  "Fitness Creator": {
    hairStyle: "Natural Texture",
    hairColor: "Warm Auburn",
    skinTone: "Deep Golden",
    skinRealism: "Real Raw Photo",
    eyeColor: "Dark Amber",
    selfieType: "Arm's Length Selfie"
  }
};

export default function CreatorPresetPanel() {
  const preset = useCreatorStore((s) => s.preset);
  const setPreset = useCreatorStore((s) => s.setPreset);
  const setCreatorField = useCreatorStore((s) => s.setCreatorField);
  const linkTalent = useCreatorStore((s) => s.linkTalent);
  const toggleLinkTalent = useCreatorStore((s) => s.toggleLinkTalent);

  const applyPreset = (presetName) => {
    setPreset(presetName);

    if (presetName === "Custom Build") return;

    const values = presetValues[presetName];
    if (!values) return;

    Object.entries(values).forEach(([key, value]) => {
      setCreatorField(key, value);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Creator Presets
      </h3>

      <div className="grid grid-cols-1 gap-2">
        {presets.map((p) => {
          const isActive = preset === p;

          return (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={
                isActive
                  ? "px-4 py-2 rounded-lg text-left bg-indigo-600 text-white"
                  : "px-4 py-2 rounded-lg text-left bg-whiteTint text-gray-600 hover:bg-whiteTint"
              }
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Toggle: Link Talent Across Scenes */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={toggleLinkTalent}
          className={
            linkTalent
              ? "w-10 h-6 rounded-full bg-indigo-600 text-white relative"
              : "w-10 h-6 rounded-full bg-whiteTint relative"
          }
        >
          <div
            className={
              linkTalent
                ? "w-5 h-5 bg-white rounded-full absolute right-1 top-0.5"
                : "w-5 h-5 bg-white rounded-full absolute left-1 top-0.5"
            }
          />
        </button>

        <span className="text-gray-600 text-sm">Link Talent Across Scenes</span>
      </div>
    </div>
  );
}
