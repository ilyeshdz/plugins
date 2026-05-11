import { createSignal, For, Show } from "solid-js";

import {
  getStoredThemes,
  getActiveTheme,
  setActiveTheme,
  removeStoredTheme,
  type InstalledTheme,
} from "../../../../lib/api.js";

import classes from "./index.scss";

const {
  ui: { SwitchItem },
} = shelter;

function TrashIcon({ onClick }: { onClick: () => void }) {
  return (
    <svg
      class={classes.trashIcon}
      onClick={onClick}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

export function SettingsPage() {
  const [refreshKey, setRefreshKey] = createSignal(0);

  const store = () => {
    refreshKey();
    return { themes: getStoredThemes(), active: getActiveTheme() };
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleSetActive = (theme: InstalledTheme | null) => {
    setActiveTheme(theme?.name ?? null);
    refresh();
  };

  const handleUninstall = async (theme: InstalledTheme) => {
    await removeStoredTheme(theme.name);
    refresh();
  };

  return (
    <div class={classes.settingsPage}>
      <div class={classes.settingsSection}>
        <div class={classes.sectionHeader}>Theme Settings</div>

        <div class={classes.themeList}>
          <div class={classes.themeItem} onClick={() => handleSetActive(null)}>
            <div class={classes.themeInfo}>
              <span class={classes.themeName}>Discord Default</span>
              <span class={classes.themeAuthor}>No theme applied</span>
            </div>
            <div class={classes.themeActions}>
              <SwitchItem
                checked={store().active === null}
                onChange={() => handleSetActive(null)}
                hideBorder
              />
            </div>
          </div>

          <For
            each={store().themes}
            children={(theme) => (
              <div
                class={`${classes.themeItem} ${store().active === theme.name ? classes.active : ""}`}
              >
                <div class={classes.themeInfo}>
                  <span class={classes.themeName}>{theme.name}</span>
                  <span class={classes.themeAuthor}>by {theme.author}</span>
                </div>
                <div class={classes.themeActions}>
                  <SwitchItem
                    checked={store().active === theme.name}
                    onChange={() => handleSetActive(theme)}
                    hideBorder
                  />
                  <TrashIcon onClick={() => handleUninstall(theme)} />
                </div>
              </div>
            )}
          />
        </div>

        <Show
          when={store().themes.length === 0}
          children={<div class={classes.noThemes}>No themes installed</div>}
        />
      </div>
    </div>
  );
}
