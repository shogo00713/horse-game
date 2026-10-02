import type { Runner } from "../types/game";
import FrameNumber from "./FrameNumber";
import styles from "./RunnerRow.module.css";

type RunnerRowProps = {
  runner: Runner;
  isSelected: boolean;
  frameNumber?: number; // 枠番(出走馬一覧と同じ色で表示する)
  selectionBadge?: string | null;
  debugLabel?: string | null; // 開発時のみ表示するデバッグ情報(調子など)
  disabled: boolean;
  onClick: () => void;
};

export default function RunnerRow({
  runner,
  isSelected,
  frameNumber,
  selectionBadge,
  debugLabel,
  disabled,
  onClick,
}: RunnerRowProps) {
  return (
    <button
      type="button"
      className={
        isSelected
          ? `${styles.runnerRow} ${styles.runnerRowSelected}`
          : styles.runnerRow
      }
      disabled={disabled}
      onClick={onClick}
    >
      {selectionBadge && (
        <span className={styles.runnerBadge}>{selectionBadge}</span>
      )}
      {frameNumber && <FrameNumber number={frameNumber} size="small" />}
      <span className={styles.runnerName}>{runner.name}</span>
      {debugLabel && <span className={styles.debugLabel}>{debugLabel}</span>}
      <span className={styles.runnerOdds}>{runner.odds.toFixed(1)}倍</span>
    </button>
  );
}
