export type ThemeId = "warm" | "ocean" | "bloom" | "sunset";

export type ThemeOption = {
  id: ThemeId;
  name: string;
  colors: string[];
};

export const themeOptions: ThemeOption[] = [
  {
    id: "warm",
    name: "Warm",
    colors: ["#F7F0E8", "#FFFBF5", "#8FBC9A", "#5E8D6A"],
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: ["#EBF5F8", "#FAFDFF", "#52B49E", "#3670B8"],
  },
  {
    id: "bloom",
    name: "Bloom",
    colors: ["#F9EFF6", "#FFFAFD", "#6FB889", "#AC5284"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#FAEFE2", "#FFFAF4", "#77B382", "#CF6F4A"],
  },
];

export const defaultThemeId: ThemeId = "warm";
