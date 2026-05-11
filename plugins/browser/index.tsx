import { unloadDropdownCss } from "../../components/dropdown/index.js";
import { PluginsIcon } from "./icons/plugins-icon.jsx";
import { ThemesIcon } from "./icons/themes-icon.jsx";
import { PluginsPage } from "./pages/plugins/index.jsx";
import { SettingsPage } from "./pages/settings/index.jsx";
import { ThemesPage, onLoadThemes } from "./pages/themes/index.jsx";

const {
  settings: { registerSection },
  util: { log },
} = shelter;

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
}
