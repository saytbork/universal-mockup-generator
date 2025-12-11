import { create } from "zustand";

export const useCreatorStore = create((set) => ({
  creator: {
    hairStyle: "",
    hairColor: "",
    skinTone: "",
    skinRealism: "",
    eyeColor: "",
    selfieType: "",
  },

  preset: "custom",
  creationMode: "lifestyle",
  sidePlacement: "right",
  bgColor: "#FFFFFF",
  linkTalent: false,

  setCreatorField: (field, value) =>
    set((state) => ({
      creator: { ...state.creator, [field]: value },
    })),

  setPreset: (preset) => set({ preset }),
  setCreationMode: (mode) => set({ creationMode: mode }),
  setSidePlacement: (side) => set({ sidePlacement: side }),
  setBgColor: (color) => set({ bgColor: color }),
  toggleLinkTalent: () =>
    set((state) => ({ linkTalent: !state.linkTalent })),
}));
