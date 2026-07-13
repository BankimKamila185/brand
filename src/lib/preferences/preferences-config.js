/**
 * How each preference should be saved.
 *
 * "client-cookie"  → write cookie on the browser only.
 * "server-cookie"  → write cookie through a Server Action.
 * "localStorage"   → save only on the client (non-layout stuff).
 * "none"           → no saving, resets on reload.
 *
 * Layout-critical prefs (sidebar_variant / sidebar_collapsible)
 * must stay consistent during SSR → so they can’t use localStorage.
 * Others are flexible and can use any persistence.
 */

import { fontKeys } from "@/lib/fonts/registry";

import {
  CONTENT_LAYOUT_VALUES,
  NAVBAR_STYLE_VALUES,
  SIDEBAR_COLLAPSIBLE_VALUES,
  SIDEBAR_VARIANT_VALUES,
} from "./layout";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES } from "./theme";

function definePreference(definition) {
  return definition;
}

function defineSSRPreference(definition) {
  return definition;
}

export const PREFERENCE_REGISTRY = {
  theme_mode: definePreference({
    values: THEME_MODE_VALUES,
    defaultValue: "dark",
    persistence: "client-cookie",
    attribute: "data-theme-mode",
  }),

  theme_preset: definePreference({
    values: THEME_PRESET_VALUES,
    defaultValue: "default",
    persistence: "client-cookie",
    attribute: "data-theme-preset",
  }),

  font: definePreference({
    values: fontKeys,
    defaultValue: "geist",
    persistence: "client-cookie",
    attribute: "data-font",
  }),

  content_layout: definePreference({
    values: CONTENT_LAYOUT_VALUES,
    defaultValue: "centered",
    persistence: "client-cookie",
    attribute: "data-content-layout",
  }),

  navbar_style: definePreference({
    values: NAVBAR_STYLE_VALUES,
    defaultValue: "sticky",
    persistence: "client-cookie",
    attribute: "data-navbar-style",
  }),

  sidebar_variant: defineSSRPreference({
    values: SIDEBAR_VARIANT_VALUES,
    defaultValue: "sidebar",
    persistence: "client-cookie",
    attribute: "data-sidebar-variant",
  }),

  sidebar_collapsible: defineSSRPreference({
    values: SIDEBAR_COLLAPSIBLE_VALUES,
    defaultValue: "icon",
    persistence: "client-cookie",
    attribute: "data-sidebar-collapsible",
  }),
};

export const PREFERENCE_KEYS = Object.freeze(Object.keys(PREFERENCE_REGISTRY));

export function getPreferencePersistence(key) {
  return PREFERENCE_REGISTRY[key].persistence;
}

export const PREFERENCE_DEFAULTS = Object.fromEntries(
  PREFERENCE_KEYS.map((key) => [key, PREFERENCE_REGISTRY[key].defaultValue]),
);

export function parsePreference(key, rawValue) {
  const definition = PREFERENCE_REGISTRY[key];
  const allowedValues = definition.values;

  if (rawValue && allowedValues.includes(rawValue)) {
    return rawValue;
  }

  return definition.defaultValue;
}
