import type { BetType, Phase, Runner } from "../types/game";
import { maxSelectable, isOrderedBetType } from "../logic/betRules";

import RunnerButton from "./RunnerButton";

type BetPanelProps = {
  betType: BetType;
  phase: Phase;
  betstr: string;
  runners: Runner[];
  selectedRunners: Runner[];

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
  onSetTotalBet,
  onSubmit,
}: BetPanelProps) {
  const isBetting = phase === "BETTING";
  const isSubmitDisabled =
    !isBetting || selectedRunners.length !== maxSelectable(betType);

  return (
    <div className="bet_panel">
      <div className="mainTitle">ベット</div>
      <div className="row">
        <div className="bet_panel_label">賭け方</div>
        <select
          className="bet_panel_select"
          value={betType}
          disabled={phase !== "BETTING"}
          onChange={(e) => onChangeBetType(e.target.value as BetType)}
        >
          <option value="WIN">単勝</option>
          <option value="PLACE">複勝</option>
          <option value="TRIO">3連複</option>
          <option value="TRIFECTA">3連単</option>
          <option value="QUINELLA">馬連</option>
          <option value="EXACTA">馬単</option>
        </select>
      </div>
      <div>
        <div className="bet_panel_label ">馬を選択</div>
        <div className="bet_panel_race_list">
          {runners.map((r) => {
            const index = selectedRunners.findIndex(
              (runner) => runner.id === r.id,
            );
            const isSelected = index !== -1;
            const badge =
              isSelected && isOrderedBetType(betType)
                ? String(index + 1)
                : null;
            return (
              <RunnerButton
                key={r.id}
                runner={r}
                isSelected={isSelected}
                selectionBadge={badge}
                disabled={phase !== "BETTING"}
                onClick={() => onSelectRunner(r)}
              />
            );
          })}
        </div>
      </div>
      <div className="row">
        <div className="row">
          <div className="bet_amount label">賭ける金額</div>
          <input
            type="number"
            value={betstr}
            disabled={phase !== "BETTING"}
            onChange={(e) => onChangeBet(e.target.value)}
          />
          <div className="bet_amount unit">円</div>
        </div>
        <button
          className="bet_panel_total_bet_button"
          disabled={phase !== "BETTING"}
          onClick={onSetTotalBet}
        >
          全額賭ける
        </button>
      </div>
      <button
        className="bet_panel_submit_button"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        確定
      </button>
    </div>
  );
}
