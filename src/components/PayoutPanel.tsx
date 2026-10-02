/**
 * 払い戻し金額の表示とその受け取りをするパネル
 *
 *  金額の表示と受け取りボタンのみ
 */

import type { Phase } from "../types/game";
import styles from "./PayoutPanel.module.css";

// 親コンポーネントから渡されるprops
type PayoutPanelProps = {
  phase: Phase;
  payout: number;
  onAccept: () => void;
};

const acceptButtonText = (payout: number) => {
  return payout > 0 ? `¥${payout} 受け取る` : "次に進む";
};

export default function PayoutPanel({
  phase,
  payout,
  onAccept,
}: PayoutPanelProps) {
  return (
    <div className={styles.payoutPanel}>
      <div className={styles.payoutLabel}>獲得金額</div>

      <div className={styles.payoutValue}>{payout} 円</div>

      <button
        className={styles.acceptButton}
        disabled={phase !== "PAYOUT"}
        onClick={onAccept}
      >
        {acceptButtonText(payout)}
      </button>
    </div>
  );
}
