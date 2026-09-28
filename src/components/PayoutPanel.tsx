/**
 * 払い戻し金額の表示とその受け取りをするパネル
 *
 *  金額の表示と受け取りボタンのみ
 */

import type { Phase } from "../types/game";

// 親コンポーネントから渡されるprops
type PayoutPanelProps = {
  phase: Phase;
  payout: number;
  onAccept: () => void;
};

export default function PayoutPanel({
  phase,
  payout,
  onAccept,
}: PayoutPanelProps) {
  return (
    <div className="payout_panel">
      <div className="payout_label">獲得金額</div>

      <div className="payout_value">{payout} 円</div>

      <button disabled={phase !== "PAYOUT"} onClick={onAccept}>
        受け取り
      </button>
    </div>
  );
}
