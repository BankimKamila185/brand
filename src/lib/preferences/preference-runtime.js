"use client";

import { PREFERENCE_REGISTRY } from "./preferences-config";
import { applyThemeMode } from "./theme-utils";

export function applyPreference(key, value) {
  if (key === "theme_mode") {
    return applyThemeMode(value);
  }

  document.documentElement.setAttribute(
    PREFERENCE_REGISTRY[key].attribute,
    value,
  );
  return undefined;
}
