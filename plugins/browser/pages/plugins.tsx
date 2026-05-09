import { createSignal, createResource, Show } from "solid-js";
import { Dropdown } from "../../../components/dropdown.js";
import { filterPlugins, togglePlugin, installPlugin, uninstallPlugin, hasPluginSettings, showPluginSettings, type Plugin, type FilterOptions } from "../../../lib/api.js";
import { SettingsIcon } from "../icons/settings-icon.jsx";
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
                                <Text tag={TextTags.textSM}>
                                    {p.description}
                                </Text>
                            </div>
                            <div class="plugin-actions">
                                <Text tag={TextTags.textXS} class="plugin-author">
                                    by {p.author}
                                </Text>
                                {p.installed ? (
                                    <div class="plugin-toggle-row">
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