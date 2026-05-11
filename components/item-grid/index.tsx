import { Show } from "solid-js";
import type { JSX } from "solid-js";

import { LoadingSpinner } from "../loading/index.js";

import classes from "./index.scss";

interface ItemGridProps<T> {
  data: () => T[] | undefined | null;
  children: (items: T[]) => JSX.Element;
  error?: () => unknown;
  loading?: () => boolean;
  emptyMessage?: string;
}

export function ItemGrid<T>(props: ItemGridProps<T>) {
  return (
    <div class={classes.grid}>
      <Show
        when={!props.loading?.()}
        fallback={
          <div class={classes.loading}>
            <LoadingSpinner size={18} />
            <span>Loading</span>
          </div>
        }
      >
        <Show
          when={!props.error?.()}
          fallback={<div class={classes.empty}>Could not load this list.</div>}
        >
          <Show
            when={(props.data()?.length ?? 0) > 0}
            fallback={
              <div class={classes.empty}>
                {props.emptyMessage ?? "No items found"}
              </div>
            }
          >
            {props.children(props.data() ?? [])}
          </Show>
        </Show>
      </Show>
    </div>
  );
}
