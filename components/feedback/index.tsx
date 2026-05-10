import classes from "./index.scss";

type FeedbackType = "warning" | "info" | "critical";

interface FeedbackProps {
    type: FeedbackType;
    children?: any;
}

export function Feedback(props: FeedbackProps) {
    return (
        <div class={`${classes.feedback} ${classes[props.type]}`}>
            {props.children}
        </div>
    );
}
