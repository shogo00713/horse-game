/**
 * 1件分のベットを作成・編集する画面
 *
 * モーダルではなく、BetPanelの中身をその場で丸ごとこれに差し替える形で使う
 * (左側のレース画面を隠さないようにするため)
 *
 * 「閉じる」: 中身が未成立(馬未選択など)な新規ベットは削除し、
 *            既に成立しているベットの場合はそのまま(編集内容を保持して)閉じる
 */

import type { BetType, Runner, Bet } from "../types/game";
import { isOrderedBetType, isValidBet, betTypeLabel } from "../logic/betRules";
import styles from "./BetEditor.module.css";
import RunnerRow from "./RunnerRow";
import { CONDITION_LABELS, type Conditions } from "../logic/condition";
import Icon from "./Icon";

const BET_TYPES: BetType[] = [
  "WIN",
  "PLACE",
  "TRIO",
  "TRIFECTA",
  "QUINELLA",
  "EXACTA",
];

type BetEditorProps = {
  bet: Bet;
  runners: Runner[];
  conditions?: Conditions; // デバッグ表示用(開発時のみ使う)
  onChangeBetType: (betType: BetType) => void;
  onChangeBetAmount: (value: string) => void;
  onToggleRunner: (runner: Runner) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function BetEditor({
  bet,
  runners,
  conditions,
  onChangeBetType,
  onChangeBetAmount,
  onToggleRunner,
  onConfirm,
  onClose,
}: BetEditorProps) {
  const isConfirmDisabled = !isValidBet(bet);

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span className={styles.title}>
          <Icon name="pencil" /> 馬券を作ろう
        </span>
        <span className={styles.guide}>
          ① 券種を選ぶ → ② 馬を選ぶ → ③ 金額を決めて「確定」！
        </span>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>① 券種を選ぶ</span>
        <select
          className={styles.select}
          value={bet.betType}
          onChange={(e) => onChangeBetType(e.target.value as BetType)}
        >
          {BET_TYPES.map((betType) => (
            <option key={betType} value={betType}>
              {betTypeLabel(betType)}
            </option>
          ))}
        </select>
      </label>

      <span className={styles.label}>② 馬を選ぶ</span>
      <div className={styles.runnerList}>
        {runners.map((r) => {
          const index = bet.selectedRunners.findIndex((s) => s.id === r.id);
          const isSelected = index !== -1;
          const badge =
            isSelected && isOrderedBetType(bet.betType)
              ? String(index + 1)
              : null;

          return (
            <RunnerRow
              key={r.id}
              runner={r}
              isSelected={isSelected}
              selectionBadge={badge}
              debugLabel={
                import.meta.env.DEV && conditions
                  ? CONDITION_LABELS[conditions[r.id]]
                  : null
              }
              disabled={false}
              onClick={() => onToggleRunner(r)}
            />
          );
        })}
      </div>

      <label className={styles.field}>
        <span className={styles.label}>③ 賭け金を決める</span>
        <div className={styles.amountRow}>
          <input
            type="text"
            inputMode="numeric"
            value={bet.betstr}
            onChange={(e) => onChangeBetAmount(e.target.value)}
          />
          <span className={styles.yen}>円</span>
        </div>
      </label>

      <div className={styles.footer}>
        <button type="button" onClick={onClose}>
          やめる
        </button>
        <button
          type="button"
          className={styles.confirmButton}
          disabled={isConfirmDisabled}
          onClick={onConfirm}
        >
          確定
        </button>
      </div>
    </div>
  );
}
