import {
  createSignal,
  createMemo,
  Show,
  For,
  onCleanup,
  onMount,
} from "solid-js";

import { Feedback } from "../../../components/feedback/index.jsx";
import {
  createLeaverQueue,
  getGuilds,
  type Guild,
} from "../../../lib/leaver.js";

import classes from "./leaver.scss";

const {
  ui: {
    Button,
    ButtonSizes,
    ButtonColors,
    Checkbox,
    Header,
    HeaderTags,
    TextBox,
    showToast,
    ToastColors,
    openConfirmationModal,
  },
} = shelter;

function getGuildIconUrl(
  guildId: string,
  icon: string | null,
): string | undefined {
  if (!icon) return undefined;
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=64`;
}

function getInitials(name: string): string {
  const words = name.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function LeaverPage() {
  const getCurrentUserId = () => {
    const userStore = shelter.flux.stores.UserStore as unknown as {
      getCurrentUser: () => { id: string };
    };
    return userStore.getCurrentUser().id;
  };

  const currentUserId = getCurrentUserId();
  const [guilds, setGuilds] = createSignal<Guild[]>([]);
  const [search, setSearch] = createSignal("");
  const [selected, setSelected] = createSignal<Set<string>>(new Set());

  const queue = createLeaverQueue(5000, () => {
    setGuilds(getGuilds());
  });

  const isRunning = createMemo(() =>
    ["running", "paused", "completed", "completed-with-errors"].includes(
      queue.state(),
    ),
  );

  onMount(() => {
    setGuilds(getGuilds());
  });

  const filteredGuilds = createMemo(() => {
    const searchTerm = search().toLowerCase();
    return guilds().filter(
      (g) =>
        g.ownerId !== currentUserId &&
        g.name.toLowerCase().includes(searchTerm),
    );
  });

  const toggleSelect = (id: string, e: Event) => {
    e.stopPropagation();
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const allSelected = createMemo(
    () =>
      filteredGuilds().length > 0 &&
      filteredGuilds().every((g) => selected().has(g.id)),
  );

  const toggleAll = () => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (allSelected()) {
        filteredGuilds().forEach((g) => newSet.delete(g.id));
      } else {
        filteredGuilds().forEach((g) => newSet.add(g.id));
      }
      return newSet;
    });
  };

  const selectedCount = createMemo(() => selected().size);

  const startLeaving = async () => {
    const selectedGuilds = guilds().filter((g) => selected().has(g.id));
    const serverNames = selectedGuilds.map((g) => g.name).join(", ");

    try {
      await openConfirmationModal({
        header: () =>
          `Leave ${selectedGuilds.length === 1 ? "Server" : "Servers"}`,
        body: () =>
          `Are you sure you want to leave ${selectedGuilds.length === 1 ? "this server" : `these ${selectedGuilds.length} servers`}?\n\n${serverNames}`,
        confirmText: "Leave",
        cancelText: "Cancel",
        type: "danger",
      });

      // User confirmed, proceed with leaving
      queue.addMany(
        selectedGuilds.map((g) => ({
          id: g.id,
          data: { id: g.id, name: g.name },
        })),
      );
      setSelected(new Set<string>());
      queue.run();
    } catch {
      // User cancelled, do nothing
    }
  };

  const stopQueue = () => {
    queue.stop();
    showToast({ message: "Queue stopped", color: ToastColors.WARNING });
  };

  const isQueueCompleted = createMemo(
    () =>
      queue.state() === "completed" ||
      queue.state() === "completed-with-errors",
  );
  const isQueueActive = createMemo(
    () => queue.state() === "running" || queue.state() === "paused",
  );

  const resetQueue = () => {
    queue.clear();
    setGuilds(getGuilds());
  };

  onCleanup(() => queue.stop());
  const stats = createMemo(() => {
    const items = queue.items();
    const total = items.length;
    const completed = items.filter((i) => i.status === "success").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const percent =
      total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;
    return { total, completed, failed, percent };
  });

  return (
    <div class={classes.page}>
      <Show
        when={!isRunning()}
        fallback={
          <div class={classes.runningState}>
            <div class={classes.progressContainer}>
              <div class={classes.progressBar}>
                <div
                  class={classes.progressFill}
                  style={{ width: `${stats().percent}%` }}
                />
              </div>
              <div class={classes.progressText}>
                {stats().completed} of {stats().total}
                {stats().failed > 0 && ` (${stats().failed} failed)`}
              </div>
            </div>

            <Show when={isQueueCompleted()}>
              <Button
                size={ButtonSizes.MEDIUM}
                color={ButtonColors.PRIMARY}
                onClick={resetQueue}
              >
                Done
              </Button>
            </Show>

            <Show when={isQueueActive()}>
              <Button
                size={ButtonSizes.MEDIUM}
                color={ButtonColors.RED}
                onClick={stopQueue}
              >
                Stop
              </Button>
            </Show>
          </div>
        }
      >
        <div class={classes.header}>
          <Header tag={HeaderTags.H2}>Server Leaver</Header>
          <Button
            size={ButtonSizes.MEDIUM}
            color={ButtonColors.SECONDARY}
            onClick={toggleAll}
          >
            {allSelected() ? "Deselect all" : "Select all"}
          </Button>
        </div>

        <Feedback type="warning">
          Leaving many servers quickly may trigger rate limits or bans. Use
          responsibly.
        </Feedback>

        <TextBox
          placeholder={`Search ${filteredGuilds().length} servers…`}
          value={search()}
          onInput={(value: string) => setSearch(value)}
        />

        <div class={classes.listWrap}>
          <Show
            when={filteredGuilds().length > 0}
            fallback={
              <div class={classes.empty}>
                <div class={classes.emptyText}>
                  {search()
                    ? `No servers match "${search()}"`
                    : "No servers found"}
                </div>
              </div>
            }
          >
            <For each={filteredGuilds()}>
              {(guild) => {
                const isSelected = () => selected().has(guild.id);
                return (
                  <div
                    class={`${classes.guildRow} ${isSelected() ? classes.guildRowSelected : ""}`}
                    onClick={(e) => toggleSelect(guild.id, e)}
                  >
                    {guild.icon ? (
                      <img
                        src={getGuildIconUrl(guild.id, guild.icon)}
                        class={classes.guildIcon}
                        alt={guild.name}
                      />
                    ) : (
                      <div class={classes.guildIconPlaceholder}>
                        {getInitials(guild.name)}
                      </div>
                    )}
                    <div class={classes.guildName}>{guild.name}</div>
                    <div class={classes.checkWrap}>
                      <Checkbox
                        checked={isSelected()}
                        onChange={(checked: boolean) => {
                          setSelected((prev) => {
                            const newSet = new Set(prev);
                            if (checked) {
                              newSet.add(guild.id);
                            } else {
                              newSet.delete(guild.id);
                            }
                            return newSet;
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              }}
            </For>
          </Show>
        </div>

        <Show when={selectedCount() > 0}>
          <div class={classes.footer}>
            <span class={classes.footerCount}>{selectedCount()} selected</span>
            <Button
              size={ButtonSizes.MEDIUM}
              color={ButtonColors.RED}
              onClick={startLeaving}
            >
              Leave {selectedCount() === 1 ? "server" : "servers"}
            </Button>
          </div>
        </Show>
      </Show>
    </div>
  );
}
