/**
 * ベットスリップ(1件分のベット)
 *
 * 賭け方・馬の選択・金額の入力を1件分だけ担当する
 * 複数件まとめる役割は BetPanel が持つ
 */

import type { BetType, Phase, Runner, Bet } from "../types/game";
import { isOrderedBetType } from "../logic/betRules";
import styles from "./BetSlip.module.css";
import RunnerButton from "./RunnerButton";

type BetSlipProps = {
  bet: Bet;
  index: number;
  phase: Phase;
  runners: Runner[];
  canRemove: boolean;
  onRemove: () => void;
  onChangeBetType: (betType: BetType) => void;
  onChangeBetAmount: (value: string) => void;
  onToggleRunner: (runner: Runner) => void;
};

export default function BetSlip({
  bet,
  index,
  phase,
  runners,
  canRemove,
  onRemove,
  onChangeBetType,
  onChangeBetAmount,
  onToggleRunner,
}: BetSlipProps) {
  const isNotBetting = phase !== "BETTING";

  return (
    <div className={styles.betSlip}>
      <div className={styles.betSlipHeader}>
        <span>BET {String(index + 1).padStart(2, "0")}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isNotBetting}
            aria-label={`BET ${index + 1} を削除`}
          >
            ×
          </button>
        )}
      </div>

      <select
        value={bet.betType}
        disabled={isNotBetting}
        onChange={(e) => onChangeBetType(e.target.value as BetType)}
      >
        <option value="WIN">単勝</option>
        <option value="PLACE">複勝</option>
        <option value="TRIO">3連複</option>
        <option value="TRIFECTA">3連単</option>
        <option value="QUINELLA">馬連</option>
        <option value="EXACTA">馬単</option>
      </select>

      <div className={styles.runnerList}>
        {runners.map((r) => {
          const i = bet.selectedRunners.findIndex((s) => s.id === r.id);
          const isSelected = i !== -1;
          const badge =
            isSelected && isOrderedBetType(bet.betType) ? String(i + 1) : null;

          return (
            <RunnerButton
              key={r.id}
              runner={r}
              isSelected={isSelected}
              selectionBadge={badge}
              disabled={isNotBetting}
              onClick={() => onToggleRunner(r)}
            />
          );
        })}
      </div>

      <div className={styles.row}>
        <input
          type="text"
          value={bet.betstr}
          disabled={isNotBetting}
          onChange={(e) => onChangeBetAmount(e.target.value)}
        />
        <span>円</span>
      </div>
    </div>
  );
}
