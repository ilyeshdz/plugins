import { unloadDropdownCss } from "../../components/dropdown/index.js";
import {
  registerDivider,
  registerHeader,
  registerPage,
} from "../../lib/shelter/settings.js";
import { PluginsIcon } from "./icons/plugins-icon.jsx";
import { ThemesIcon } from "./icons/themes-icon.jsx";
import { PluginsPage } from "./pages/plugins/index.jsx";
import { SettingsPage } from "./pages/settings/index.jsx";
import { ThemesPage, onLoadThemes } from "./pages/themes/index.jsx";

const {
  util: { log },
} = shelter;

const allSettings = [
  registerDivider(),
  registerHeader("Browser"),
  registerPage("hdzilyes-plugins", "Plugins", PluginsPage, PluginsIcon),
  registerPage("hdzilyes-themes", "Themes", ThemesPage, ThemesIcon),
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
