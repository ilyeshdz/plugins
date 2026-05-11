import { unloadDropdownCss } from "../../components/dropdown/index.js";
import {
  createChangelogButton,
  registerChangelogOnLoad,
} from "../../lib/changelog.js";
import { PluginsIcon } from "./icons/plugins-icon.jsx";
import { ThemesIcon } from "./icons/themes-icon.jsx";
import { PluginsPage } from "./pages/plugins/index.jsx";
import { SettingsPage } from "./pages/settings/index.jsx";
import { ThemesPage, onLoadThemes } from "./pages/themes/index.jsx";
import { version } from "./plugin.json";

const {
  settings: { registerSection },
  util: { log },
} = shelter;

export const changelogOptions = {
  title: "Browser",
  subtitle: `version ${version}`,
  blurb:
    "A plugin browser for Shelter — discover, install, and manage plugins and themes without leaving Discord.",
  pluginName: "browser",
  currentVersion: version,
  entries: [
    {
      version: "1.0.0",
      date: "2025-05-11",
      changes: [
        {
          title: "New Features",
          type: "added",
          blurb: "Everything you need to browse Shelter add-ons in one place.",
          items: [
            "Browse the complete Shelter plugin registry in-app",
            "Install, uninstall, and toggle plugins without leaving Discord",
            "Install and uninstall themes with live CSS preview",
            "Search plugins and themes by name, description, or author",
            "Filter plugins by status: all, enabled, disabled, or installed",
            "Filter themes by installed status",
            "Quick access to plugin settings from the browser",
            "Theme CSS is automatically loaded on plugin startup",
          ],
        },
      ],
    },
  ],
};

const allSettings = [
  registerSection("divider"),
  registerSection("header", "Browser"),
  registerSection("section", "hdzilyes-plugins", "Plugins", PluginsPage, {
    icon: PluginsIcon,
  }),
  registerSection("section", "hdzilyes-themes", "Themes", ThemesPage, {
    icon: ThemesIcon,
  }),
];

log("Settings registered");

export function settings() {
  return <SettingsPage />;
}

export function onUnload() {
  allSettings.forEach((s) => s?.());
  unloadDropdownCss();
}

export function onLoad() {
  onLoadThemes();
  registerChangelogOnLoad(changelogOptions);
}

export const ChangelogButton = createChangelogButton(changelogOptions);
