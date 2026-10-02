/**
 * Betする画面を構成するコンポーネント
 *
 * BETTTINGフェーズで基本的に働く画面
 * 選んだベットタイプ、馬、金額は useHorseGame.ts の state に保存される
 */

import type { BetType, Phase, Runner } from "../types/game";
import { maxSelectable, isOrderedBetType } from "../logic/betRules";
import styles from "./BetPanel.module.css";

import RunnerButton from "./RunnerButton";

// 親コンポーネントから渡されるprops
type BetPanelProps = {
  // 親 -> 子へのデータの受け渡し
  betType: BetType;
  phase: Phase;
  betstr: string;
  runners: Runner[];
  selectedRunners: Runner[];

  // 子 -> 親へのイベント通知
  onChangeBetType: (betType: BetType) => void;
  onChangeBet: (value: string) => void;
  onSelectRunner: (runner: Runner) => void;
  onSetTotalBet: () => void;
  onSubmit: () => void;
};

export default function BetPanel({
  betType,
  phase,
  betstr,
  selectedRunners,
  runners,
  onChangeBetType,
  onChangeBet,
  onSelectRunner,
  onSubmit,
}: BetPanelProps) {
  // ベット受付中かどうか
  const isNotBetting = phase !== "BETTING";

  // ベット時ではない or 馬を最大数選んでいたらボタンを押せないようにする
  const isSubmitDisabled =
    isNotBetting || selectedRunners.length !== maxSelectable(betType);

  return (
    <div className={styles.betPanel}>
      <div className={styles.mainTitle}>ベット</div>

      <div className={styles.row}>
        <div>賭け方</div>
        <select
          className={styles.betPanelSelect}
          value={betType}
          disabled={isNotBetting}
          onChange={(e) => onChangeBetType(e.target.value as BetType)}
        >
          <option value="WIN">単勝 </option>
          <option value="PLACE">複勝 </option>
          <option value="TRIO">3連複</option>
          <option value="TRIFECTA">3連単</option>
          <option value="QUINELLA">馬連 </option>
          <option value="EXACTA">馬単 </option>
        </select>
      </div>

      <div>
        <div>馬を選択</div>

        {/* 登録されている馬をボタンとして表示 */}
        <div className={styles.betPanelRaceList}>
          {runners.map((r) => {
            const index = selectedRunners.findIndex(
              (runner) => runner.id === r.id,
            );

            // 選択されているかどうかを判定
            const isSelected = index !== -1;

            // 選択された馬に番号を表示
            const badge =
              isSelected && isOrderedBetType(betType)
                ? String(index + 1)
                : null;

            return (
              // 選択未選択等の表示はRunnerButtonに任せる
              <RunnerButton
                key={r.id}
                runner={r}
                isSelected={isSelected}
                selectionBadge={badge}
                disabled={isNotBetting}
                onClick={() => onSelectRunner(r)}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.row}>
          <div className={styles.betAmountLabel}>賭ける金額</div>
          <input
            type="text"
            value={betstr}
            disabled={isNotBetting}
            onChange={(e) => onChangeBet(e.target.value)}
          />
          <div className={styles.betAmountUnit}>円</div>
        </div>
      </div>

      <button
        className={styles.betPanelSubmitButton}
        disabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        確定
      </button>
    </div>
  );
}
