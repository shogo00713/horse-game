/**
 * 確定済みの1件分のベットを、1行の簡易表示にするコンポーネント
 *
 * クリックすると編集画面を開く(onEdit)。×ボタンは削除専用
 */

import type { Bet } from "../types/game";
import { betTypeLabel, formatSelectedRunners } from "../logic/betRules";
import styles from "./BetSummary.module.css";

type BetSummaryProps = {
  bet: Bet;
  index: number;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

export default function BetSummary({
  bet,
  index,
  disabled,
  onEdit,
  onRemove,
}: BetSummaryProps) {
  const runnerNames = formatSelectedRunners(bet);

  return (
    <div className={styles.betSummary}>
      <button
        type="button"
        className={styles.editButton}
        disabled={disabled}
        onClick={onEdit}
      >
        <span className={styles.index}>BET{index + 1}</span>
        <div className={styles.detail}>
          <span className={styles.betType}>{betTypeLabel(bet.betType)}</span>
          <span className={styles.runnerNames}>{runnerNames}</span>
        </div>
        <span className={styles.amount}>¥{bet.betstr}</span>
      </button>
      <button
        type="button"
        className={styles.removeButton}
        disabled={disabled}
        onClick={onRemove}
        aria-label={`BET ${index + 1} を削除`}
      >
        ×
      </button>
    </div>
  );
}
