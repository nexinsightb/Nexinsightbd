import type { ComponentType } from "react";
import type { Restaurant, RestaurantTheme } from "@/types/restaurant";
import DarkGoldTheme from "./DarkGoldTheme";

export const themeMap: Record<
  RestaurantTheme,
  ComponentType<{ restaurant: Restaurant }>
> = {
  "theme-1": DarkGoldTheme,
};

export function getThemeComponent(themeName?: RestaurantTheme) {
  const theme = themeName && themeMap[themeName] ? themeName : "theme-1";
  return themeMap[theme];
}
