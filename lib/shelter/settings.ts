import type { Component } from "solid-js";

type SettingsIcon = Component | (() => void);

export function registerDivider(): () => void {
  return shelter.settings.registerSection("divider");
}

export function registerHeader(title: string): () => void {
  return shelter.settings.registerSection("header", title);
}

export function registerPage(
  id: string,
  title: string,
  component: Component,
  icon?: SettingsIcon,
): () => void {
  return shelter.settings.registerSection("section", id, title, component, {
    icon,
  });
}
