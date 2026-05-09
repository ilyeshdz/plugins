import { createSignal, createResource, Show } from "solid-js";
import { Dropdown } from "../../../components/dropdown.js";
import { filterPlugins, togglePlugin, installPlugin, uninstallPlugin, hasPluginSettings, showPluginSettings, type Plugin, type FilterOptions } from "../../../lib/api.js";
import css from "./plugins.scss";

const {
    ui: {
        Header,
        Text,
        TextTags,
        HeaderTags,
        TextBox,
        SwitchItem,
        Button,
        ButtonColors,
        ButtonSizes,
        injectCss,
    }
} = shelter;

export const unloadPluginsCss = injectCss(css);

function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.34-.07.67-.07 1s.03.66.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63Z"/>
        </svg>
    );
}

async function loadPlugins(search: string, status: FilterOptions["status"]): Promise<Plugin[]> {
    return filterPlugins({ search, status });
}

export function PluginsPage() {
    const [search, setSearch] = createSignal("");
    const [filter, setFilter] = createSignal<FilterOptions["status"]>("all");

    const [plugins, { refetch }] = createResource(
        () => ({ search: search(), status: filter() }),
        (props) => loadPlugins(props.search, props.status)
    );

    const handleToggle = async (plugin: Plugin) => {
        await togglePlugin(plugin);
        refetch();
    };

    const handleInstall = async (plugin: Plugin) => {
        await installPlugin(plugin);
        refetch();
    };

    const handleUninstall = async (plugin: Plugin) => {
        await uninstallPlugin(plugin);
        refetch();
    };

    const handleShowSettings = (plugin: Plugin) => {
        showPluginSettings(plugin);
    };

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
                        { value: "installed", label: "Installed" },
                    ]}
                    value={filter()}
                    onChange={setFilter}
                />
            </div>

            <div class="section-header">
                <Header tag={HeaderTags.H3} margin={false}>
                    Plugins
                </Header>
            </div>

            <div class="plugins-grid">
                <Show when={plugins()} keyed fallback={<div>Loading...</div>} children={(items) => items.map((p: Plugin) => (
                        <div class="plugin-item">
                            <div class="plugin-header">
                                <div class="plugin-title-area">
                                    <Header tag={HeaderTags.H4} margin={false}>
                                        {p.name}
                                    </Header>
                                </div>
                                {p.installed && hasPluginSettings(p) && (
                                    <span
                                        class="plugin-icon-settings"
                                        title="Settings"
                                        onClick={() => handleShowSettings(p)}
                                    >
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
                                    by {p.author}
                                </Text>
                                {p.installed ? (
                                    <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
                                        <SwitchItem
                                            checked={p.enabled}
                                            onChange={() => handleToggle(p)}
                                            hideBorder
                                        >{""}</SwitchItem>
                                        <Button
                                            color={ButtonColors.SECONDARY}
                                            size={ButtonSizes.SMALL}
                                            onClick={() => handleUninstall(p)}
                                        >
                                            Uninstall
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        color={ButtonColors.PRIMARY}
                                        size={ButtonSizes.SMALL}
                                        onClick={() => handleInstall(p)}
                                    >
                                        Install
                                    </Button>
                                )}
                            </div>
                        </div>
                ))} />
            </div>
        </div>
    );
}