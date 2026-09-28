import type { Phase } from "../types/game";

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
