import { createSignal } from "solid-js";

const {
    ui: {
        Text,
        TextTags,
        Button,
        ButtonColors,
        ButtonSizes,
        SwitchItem,
        injectCss
    }
} = shelter;

const css = injectCss(`
    .plugin-card {
        background: var(--background-muted);
        border: 1px solid var(--background-accent);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        transition: border-color 0.2s;
    }

    .plugin-card:hover {
        border-color: var(--background-modifier-accent);
    }

    .plugin-info {
        flex: 1;
    }

    .plugin-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }

    .plugin-name {
        font-weight: 600;
    }

    .plugin-badge {
        background: var(--status-positive);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
    }

    .plugin-description {
        color: var(--header-secondary);
        margin-bottom: 8px;
    }

    .plugin-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--header-secondary);
    }

    .plugin-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-left: 16px;
    }
`);

interface Plugin {
    id: string;
    name: string;
    description: string;
    author: string;
    version: string;
    installed: boolean;
    enabled: boolean;
    category: string;
    downloads: string;
    rating: number;
}

interface PluginCardProps {
    plugin: Plugin;
}

export function PluginCard(props: PluginCardProps) {
    const [enabled, setEnabled] = createSignal(props.plugin.enabled);

    return (
        <div class="plugin-card">
            <div class="plugin-info">
                <div class="plugin-title-row">
                    <Text tag={TextTags.textMD} class="plugin-name">
                        {props.plugin.name}
                    </Text>
                    {props.plugin.installed && (
                        <span class="plugin-badge">INSTALLED</span>
                    )}
                </div>
                <Text tag={TextTags.textSM} class="plugin-description">
                    {props.plugin.description}
                </Text>
                <div class="plugin-meta">
                    <span>v{props.plugin.version}</span>
                    <span>•</span>
                    <span>{props.plugin.author}</span>
                    <span>•</span>
                    <span>{props.plugin.downloads} downloads</span>
                    <span>•</span>
                    <span>⭐ {props.plugin.rating}</span>
                </div>
            </div>
            <div class="plugin-actions">
                {props.plugin.installed ? (
                    <>
                        <SwitchItem
                            checked={enabled()}
                            onChange={setEnabled}
                            hideBorder
                        />
                        <Button
                            color={ButtonColors.SECONDARY}
                            size={ButtonSizes.SMALL}
                        >
                            Uninstall
                        </Button>
                    </>
                ) : (
                    <Button
                        color={ButtonColors.PRIMARY}
                        size={ButtonSizes.SMALL}
                    >
                        Install
                    </Button>
                )}
            </div>
        </div>
    );
}
