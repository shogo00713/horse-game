import type { Runner } from "../types/game";
import styles from "./RunnerButton.module.css";

type RunnerButtonProps = {
  runner: Runner;
  isSelected: boolean;
  selectionBadge?: string | null;
  disabled: boolean;
  onClick: () => void;
};

export default function RunnerButton({
  runner,
  isSelected,
  selectionBadge,
  disabled,
  onClick,
}: RunnerButtonProps) {
  return (
    <button
      type="button"
      className={
        isSelected
          ? `${styles.runner} ${styles.runnerSelected}`
          : styles.runner
      }
      disabled={disabled}
      onClick={onClick}
    >
      {selectionBadge && (
        <span className={styles.runnerBadge}>{selectionBadge}</span>
      )}

      <div className={styles.runnerName}>{runner.name}</div>

      <div className={styles.runnerOdds}>Odds {runner.odds.toFixed(1)}</div>
    </button>
  );
}
