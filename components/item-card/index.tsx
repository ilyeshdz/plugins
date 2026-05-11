import type { JSX } from "solid-js";

import classes from "./index.scss";

interface ItemCardProps {
  title: JSX.Element;
  description: JSX.Element;
  author?: string;
  action: JSX.Element;
  extra?: JSX.Element;
  actionsClass?: string;
}

export function ItemCard(props: ItemCardProps) {
  return (
    <div class={classes.card}>
      <div class={classes.header}>
        <div class={classes.titleArea}>{props.title}</div>
        {props.extra}
      </div>
      <div class={classes.descArea}>{props.description}</div>
      <div class={`${classes.actions} ${props.actionsClass || ""}`}>
        <span class={classes.author}>
          {props.author ? `by ${props.author}` : ""}
        </span>
        {props.action}
      </div>
    </div>
  );
}
