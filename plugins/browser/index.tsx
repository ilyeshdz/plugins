import { PluginsPage, unloadPluginsCss } from "./pages/plugins.jsx";
import { SettingsPage, unloadSettingsCss } from "./pages/settings.jsx";
import { PluginsIcon } from "./icons/plugins-icon.jsx";
import { unloadDropdownCss } from "../../components/dropdown.js";

const {
    settings: {
        registerSection
    },
    util: {
        log
    }
} = shelter;

const allSettings = [
    registerSection(
        "divider"
    ),
    registerSection(
        "header",
        "Browser"
    ),
    registerSection(
        "section",
        "hdzilyes-plugins",
        "Plugins",
        PluginsPage,
        {
            icon: PluginsIcon
        }
    ),
]

log("Settings registered")

export function settings() {
    return <SettingsPage />;
}

export function onUnload() {
    allSettings.forEach(setting => setting && setting());
    unloadPluginsCss();
    unloadSettingsCss();
    unloadDropdownCss();
}