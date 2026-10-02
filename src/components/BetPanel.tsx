/**
 * Betする画面を構成するコンポーネント
 *
 * BETTINGフェーズで基本的に働く画面
 * 最大 maxBets 件まで、同一レースに対するベットを同時に持てる
 */

import type { BetType, Phase, Runner, Bet } from "../types/game";
import styles from "./BetPanel.module.css";
import BetSlip from "./BetSlip";

// 親コンポーネントから渡されるprops
type BetPanelProps = {
  bets: Bet[];
  phase: Phase;
  runners: Runner[];
  maxBets: number;
  totalBetAmount: number;
  canSubmit: boolean;

  onAddBet: () => void;
  onRemoveBet: (id: string) => void;
  onChangeBetType: (id: string, betType: BetType) => void;
  onChangeBetAmount: (id: string, value: string) => void;
  onToggleRunner: (id: string, runner: Runner) => void;
  onSubmit: () => void;
};

export default function BetPanel({
  bets,
  phase,
  runners,
  maxBets,
  totalBetAmount,
  canSubmit,
  onAddBet,
  onRemoveBet,
  onChangeBetType,
  onChangeBetAmount,
  onToggleRunner,
  onSubmit,
}: BetPanelProps) {
  const isNotBetting = phase !== "BETTING";
  const isSubmitDisabled = isNotBetting || !canSubmit;
  const isAddDisabled = isNotBetting || bets.length >= maxBets;

  return (
    <div className={styles.betPanel}>
      <div className={styles.mainTitle}>BET</div>

      {bets.map((bet, index) => (
        <BetSlip
          key={bet.id}
          bet={bet}
          index={index}
          phase={phase}
          runners={runners}
          canRemove={bets.length > 1}
          onRemove={() => onRemoveBet(bet.id)}
          onChangeBetType={(betType) => onChangeBetType(bet.id, betType)}
          onChangeBetAmount={(value) => onChangeBetAmount(bet.id, value)}
          onToggleRunner={(runner) => onToggleRunner(bet.id, runner)}
        />
      ))}

      <button type="button" onClick={onAddBet} disabled={isAddDisabled}>
        ＋ ベットを追加({bets.length}/{maxBets})
      </button>

      <div className={styles.row}>
        <span>合計</span>
        <span>¥{totalBetAmount}</span>
      </div>

      <button
        className={styles.betPanelSubmitButton}
        disabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        BETする
      </button>
    </div>
  );
}
