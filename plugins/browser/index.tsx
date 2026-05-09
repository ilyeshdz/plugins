import { PluginsPage, unloadPluginsCss } from "./pages/plugins.jsx";
import { ThemesPage } from "./pages/themes.jsx";
import { PluginsIcon } from "./icons/plugins-icon.jsx";
import { ThemesIcon } from "./icons/themes-icon.jsx";
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
    registerSection(
        "section",
        "hdzilyes-themes",
        "Themes",
        ThemesPage,
        {
            icon: ThemesIcon
        }
    )
]

log("Settings registered")

export function onUnload() {
    allSettings.forEach(setting => setting && setting());
    unloadPluginsCss();
    unloadDropdownCss();
}