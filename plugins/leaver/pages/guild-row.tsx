import type { Guild } from "../../../lib/leaver.js";

import classes from "./leaver.scss";

const {
  ui: { Checkbox },
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

export function GuildRow(props: {
  guild: Guild;
  selected: boolean;
  onSelectedChange(checked: boolean): void;
}) {
  const toggle = () => props.onSelectedChange(!props.selected);

  return (
    <div
      class={`${classes.guildRow} ${
        props.selected ? classes.guildRowSelected : ""
      }`}
      onClick={toggle}
    >
      {props.guild.icon ? (
        <img
          src={getGuildIconUrl(props.guild.id, props.guild.icon)}
          class={classes.guildIcon}
          alt={props.guild.name}
        />
      ) : (
        <div class={classes.guildIconPlaceholder}>
          {getInitials(props.guild.name)}
        </div>
      )}
      <div class={classes.guildName}>{props.guild.name}</div>
      <div
        class={classes.checkWrap}
        onClick={(event) => event.stopPropagation()}
      >
        <Checkbox
          checked={props.selected}
          onChange={(checked: boolean) => props.onSelectedChange(checked)}
        />
      </div>
    </div>
  );
}
