import { Show } from "solid-js";
import classes from "./index.scss";

interface ItemGridProps {
    data: () => any;
    children: (items: any) => any;
}

export function ItemGrid(props: ItemGridProps) {
    return (
        <div class={classes.grid}>
            <Show when={props.data()} keyed fallback={<div>Loading...</div>} children={props.children} />
        </div>
    );
}
