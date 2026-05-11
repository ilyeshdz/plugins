import { type Component } from "solid-js";

const {
  ui: {
    openModal,
    ModalRoot,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalSizes,
    Button,
    ButtonColors,
    ButtonSizes,
    niceScrollbarsClass,
  },
} = shelter;

const STORAGE_PREFIX = "hdzilyes_changelog_";

export interface ChangeGroup {
  title: string;
  type?: string;
  blurb?: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date?: string;
  changes: ChangeGroup[];
}

export interface ChangelogOptions {
  title: string;
  subtitle?: string;
  blurb?: string;
  pluginName: string;
  currentVersion: string;
  entries: ChangelogEntry[];
}

function storageKey(pluginName: string): string {
  return `${STORAGE_PREFIX}${pluginName}`;
}

export function getLastSeenVersion(pluginName: string): string | null {
  try {
    return localStorage.getItem(storageKey(pluginName));
  } catch {
    return null;
  }
}

export function setLastSeenVersion(pluginName: string, version: string): void {
  try {
    localStorage.setItem(storageKey(pluginName), version);
  } catch {}
}

export function shouldShowChangelog(
  pluginName: string,
  currentVersion: string,
): boolean {
  return getLastSeenVersion(pluginName) !== currentVersion;
}

function filterNewEntries(
  entries: ChangelogEntry[],
  lastSeen: string | null,
): ChangelogEntry[] {
  if (!lastSeen) return entries;
  return entries.filter((entry) => entry.version > lastSeen);
}

const styles = {
  header: {
    display: "flex",
    "flex-direction": "column",
    gap: "4px",
    "margin-bottom": "16px",
  },
  title: {
    color: "var(--header-primary)",
    "font-size": "20px",
    "font-weight": "600",
    "line-height": "1.25",
  },
  muted: {
    color: "var(--text-muted)",
    "font-size": "13px",
    "line-height": "1.4",
  },
  body: {
    display: "flex",
    "flex-direction": "column",
    gap: "18px",
    "max-height": "420px",
    overflow: "auto",
  },
  version: {
    color: "var(--header-secondary)",
    "font-size": "12px",
    "font-weight": "700",
    "text-transform": "uppercase",
    "letter-spacing": "0.04em",
    "margin-bottom": "8px",
  },
  groupTitle: {
    color: "var(--header-primary)",
    "font-size": "14px",
    "font-weight": "600",
    "margin-bottom": "4px",
  },
  list: {
    margin: "0",
    padding: "0 0 0 18px",
  },
  item: {
    color: "var(--text-normal)",
    "font-size": "14px",
    "line-height": "1.45",
    "margin-bottom": "4px",
  },
  footer: {
    display: "flex",
    "justify-content": "flex-end",
    width: "100%",
  },
} as const;

const ChangelogModal: Component<{
  close(): void;
  options: ChangelogOptions;
  entries: ChangelogEntry[];
}> = (props) => {
  const opts = props.options;

  return (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={props.close} />
      <ModalBody>
        <div style={styles.header}>
          <div style={styles.title}>{opts.title}</div>
          {opts.subtitle && <div style={styles.muted}>{opts.subtitle}</div>}
          {opts.blurb && <div style={styles.muted}>{opts.blurb}</div>}
        </div>

        <div class={niceScrollbarsClass()} style={styles.body}>
          {props.entries.map((entry) => (
            <section>
              <div style={styles.version}>
                v{entry.version}
                {entry.date ? ` - ${entry.date}` : ""}
              </div>
              {entry.changes.map((group) => (
                <div>
                  <div style={styles.groupTitle}>{group.title}</div>
                  {group.blurb && <div style={styles.muted}>{group.blurb}</div>}
                  <ul style={styles.list}>
                    {group.items.map((item) => (
                      <li style={styles.item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <div style={styles.footer}>
          <Button
            color={ButtonColors.PRIMARY}
            size={ButtonSizes.SMALL}
            onClick={props.close}
          >
            Done
          </Button>
        </div>
      </ModalFooter>
    </ModalRoot>
  );
};

export function showChangelogModal(options: ChangelogOptions): void {
  const lastSeen = getLastSeenVersion(options.pluginName);
  const newEntries = filterNewEntries(options.entries, lastSeen);
  const entriesToShow = newEntries.length > 0 ? newEntries : options.entries;

  openModal((props: { close(): void }) => (
    <ChangelogModal
      close={props.close}
      options={options}
      entries={entriesToShow}
    />
  ));

  setLastSeenVersion(options.pluginName, options.currentVersion);
}

export function registerChangelogOnLoad(options: ChangelogOptions): void {
  if (shouldShowChangelog(options.pluginName, options.currentVersion)) {
    showChangelogModal(options);
  }
}

export function createChangelogButton(options: ChangelogOptions): Component {
  return () => (
    <Button
      color={ButtonColors.SECONDARY}
      size={ButtonSizes.SMALL}
      onClick={() => showChangelogModal(options)}
    >
      Changelog
    </Button>
  );
}
