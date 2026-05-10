import classes from "./index.scss";

interface ItemCardProps {
    title: any;
    description: any;
    author: string;
    action: any;
    extra?: any;
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
                <span class={classes.author}>by {props.author}</span>
                {props.action}
            </div>
        </div>
    );
}
