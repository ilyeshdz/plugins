import classes from "./index.scss";

interface LoadingSpinnerProps {
  size?: number;
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  const size = props.size ?? 24;
  return (
    <div
      class={classes.spinner}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          opacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>
  );
}
