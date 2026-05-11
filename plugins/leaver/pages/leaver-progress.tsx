import classes from "./leaver.scss";

const {
  ui: { Button, ButtonColors, ButtonSizes },
} = shelter;

export function LeaverProgress(props: {
  completed: number;
  failed: number;
  total: number;
  percent: number;
  completedQueue: boolean;
  activeQueue: boolean;
  onDone(): void;
  onStop(): void;
}) {
  return (
    <div class={classes.runningState}>
      <div class={classes.progressContainer}>
        <div class={classes.progressBar}>
          <div
            class={classes.progressFill}
            style={{ width: `${props.percent}%` }}
          />
        </div>
        <div class={classes.progressText}>
          {props.completed} of {props.total}
          {props.failed > 0 && ` (${props.failed} failed)`}
        </div>
      </div>

      {props.completedQueue && (
        <Button
          size={ButtonSizes.MEDIUM}
          color={ButtonColors.PRIMARY}
          onClick={props.onDone}
        >
          Done
        </Button>
      )}

      {props.activeQueue && (
        <Button
          size={ButtonSizes.MEDIUM}
          color={ButtonColors.RED}
          onClick={props.onStop}
        >
          Stop
        </Button>
      )}
    </div>
  );
}
