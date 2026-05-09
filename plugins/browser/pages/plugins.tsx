import { createSignal } from "solid-js";
import { Dropdown } from "../../../components/dropdown.js";
import css from "./plugins.scss";

const {
    ui: {
        Header,
        Text,
        TextTags,
        HeaderTags,
        TextBox,
        SwitchItem,
        injectCss
    }
} = shelter;

export const unloadPluginsCss = injectCss(css);

const plugins = [
    {
        id: "account-panel",
        name: "AccountPanelServer",
        description: "Right click your account panel in the bottom left to view your profile in the current server",
        hasSettings: true,
        enabled: true
    },
    {
        id: "always-animate",
        name: "AlwaysAnimate",
        description: "Animates anything that can be animated",
        hasSettings: false,
        enabled: false
    },
    {
        id: "always-expand",
        name: "AlwaysExpandRoles",
        description: "Always expands the role list in profile popouts",
        hasSettings: false,
        enabled: false
    },
    {
        id: "always-trust",
        name: "AlwaysTrust",
        description: "Removes the annoying untrusted domain and suspicious file popup",
        hasSettings: true,
        enabled: false
    },
    {
        id: "better-emojis",
        name: "BetterEmojis",
        description: "Display emojis in high quality across all channels",
        hasSettings: true,
        enabled: true
    },
    {
        id: "clone-tags",
        name: "CloneTags",
        description: "Clone role tags to multiple roles at once",
        hasSettings: false,
        enabled: false
    }
];

function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.34-.07.67-.07 1s.03.66.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63Z"/>
        </svg>
    );
}


export function PluginsPage() {
    const [search, setSearch] = createSignal("");
    const [filter, setFilter] = createSignal("all");
    const [tagFilter, setTagFilter] = createSignal("all");

    return (
        <div class="page">
            <Header tag={HeaderTags.H2}>
                Browse plugins
            </Header>
            <div class="search-container">
                <TextBox
                    value={search()}
                    onInput={setSearch}
                    placeholder="Search for a plugin..."
                />
            </div>

            <div class="filters-row">
                <Dropdown
                    options={[
                        { value: "all", label: "All Plugins" },
                        { value: "enabled", label: "Enabled" },
                        { value: "disabled", label: "Disabled" },
                    ]}
                    value={filter()}
                    onChange={setFilter}
                />
                <Dropdown
                    options={[
                        { value: "all", label: "All Tags" },
                        { value: "utility", label: "Utility" },
                        { value: "appearance", label: "Appearance" },
                        { value: "moderation", label: "Moderation" },
                    ]}
                    value={tagFilter()}
                    onChange={setTagFilter}
                />
            </div>

            <div class="section-header">
                <Header tag={HeaderTags.H3} margin={false}>
                    Plugins
                </Header>
            </div>

            <div class="plugins-grid">
                {plugins.map(p => (
                    <div class="plugin-item">
                        <div class="plugin-header">
                            <div class="plugin-title-area">
                                <Header tag={HeaderTags.H4} margin={false}>
                                    {p.name}
                                </Header>
                            </div>
                            {p.hasSettings && (
                                <span class="plugin-icon-settings" title="Settings">
                                    <SettingsIcon />
                                </span>
                            )}
                        </div>
                        <div class="plugin-desc-area">
                            <Text tag={TextTags.textSM} style={{ color: "var(--text-muted)" }}>
                                {p.description}
                            </Text>
                        </div>
                        <div class="plugin-actions">
                            <Text tag={TextTags.textXS} style={{ color: "var(--text-muted)" }}>
                                v1.0.0 • by Author
                            </Text>
                            <SwitchItem
                                checked={p.enabled}
                                onChange={() => {}}
                                hideBorder
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}