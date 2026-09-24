import type { BetType, Phase, Runner } from "../types/game";

import RunnerButton from "./RunnerButton";

type BetPanelProps = {
    conditionById: Record<string, string>;
    betType: BetType;
    phase: Phase;
    betstr: string;
    runners: Runner[];
    oneSelectedRunner: Runner | null;
    trioSelectedRunner: Runner[];
    trifectaSelectedRunner: Runner[];
    quinellaSelectedRunner: Runner[];
    exactaSelectedRunner: Runner[];

    onChangeBetType: (betType: BetType) => void;
    onChangeBet: (value: string) => void;
    onSelectRunner: (runner: Runner) => void;
    toggleTrioSelectedRunner: (runner: Runner) => void;
    toggleTrifectaSelectedRunner: (runner: Runner) => void;
    toggleQuinellaSelectedRunner: (runner: Runner) => void;
    toggleExactaSelectedRunner: (runner: Runner) => void;
    onSetTotalBet: () => void;
    onSubmit: () => void;
};

export default function BetPanel({ conditionById, betType, phase, betstr, oneSelectedRunner, trioSelectedRunner, trifectaSelectedRunner, quinellaSelectedRunner, exactaSelectedRunner, runners,
  onChangeBetType, onChangeBet, onSelectRunner, toggleTrioSelectedRunner, toggleTrifectaSelectedRunner, toggleQuinellaSelectedRunner, toggleExactaSelectedRunner,  onSetTotalBet, onSubmit }: BetPanelProps) {
  
  const isBetting = phase === "BETTING";
  const isSingleReady = (betType === "WIN" || betType === "PLACE") && oneSelectedRunner !== null;
  const isTrioReady = betType === "TRIO" && trioSelectedRunner.length === 3;
  const isTrifectaReady = betType === "TRIFECTA" && trifectaSelectedRunner.length === 3;
  const isQuinellaReady = betType === "QUINELLA" && quinellaSelectedRunner.length === 2;
  const isExactaReady = betType === "EXACTA" && exactaSelectedRunner.length === 2;
  const isSubmitDisabled = !isBetting || !(isSingleReady || isTrioReady || isTrifectaReady || isQuinellaReady || isExactaReady);

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
                  <option value="WIN"  >単勝</option>
                  <option value="PLACE">複勝</option>
                  <option value="TRIO" >3連複</option>
                  <option value="TRIFECTA" >3連単</option>
                  <option value="QUINELLA" >馬連</option>
                  <option value="EXACTA" >馬単</option>
                </select>
              </div>
            <div>
              <div className="bet_panel_label ">馬を選択</div>
              <div className="bet_panel_race_list">

                {(betType === "WIN" || betType === "PLACE") && runners.map((r) => (
                    <RunnerButton
                        key={r.id}
                        condition={conditionById[r.id] || "NORMAL"}
                        runner={r}
                        isSelected={oneSelectedRunner?.id === r.id}
                        selectionBadge={null}
                        disabled={phase !== "BETTING"}
                        onClick={() => onSelectRunner(r)}
                    />
                ))}
                {betType === "TRIO" && runners.map((r) => (
                    <RunnerButton
                        key={r.id}
                        condition={conditionById[r.id] || "NORMAL"}
                        runner={r}
                        isSelected={trioSelectedRunner.some((runner) => runner.id === r.id)}
                        selectionBadge = {null}
                        disabled={phase !== "BETTING"}
                        onClick={() => toggleTrioSelectedRunner(r)}
                    />
                ))}
                {betType === "TRIFECTA" && runners.map((r) => {
                  const index = trifectaSelectedRunner.findIndex((runner) => runner.id === r.id);
                  const isSelected = index !== -1;
                  const badge = isSelected ? String(index + 1) : null;
                    return (
                    <RunnerButton
                        key={r.id}
                        condition={conditionById[r.id] || "NORMAL"}
                        runner={r}
                        isSelected={trifectaSelectedRunner.some((runner) => runner.id === r.id)}
                        selectionBadge={badge}
                        disabled={phase !== "BETTING"}
                        onClick={() => toggleTrifectaSelectedRunner(r)}
                    />
                );})}
                {betType === "QUINELLA" && runners.map((r) => {
                    return (
                    <RunnerButton
                        key={r.id}
                        condition={conditionById[r.id] || "NORMAL"}
                        runner={r}
                        isSelected={quinellaSelectedRunner.some((runner) => runner.id === r.id)}
                        selectionBadge={null}
                        disabled={phase !== "BETTING"}
                        onClick={() => toggleQuinellaSelectedRunner(r)}
                    />
                );})}
                {betType === "EXACTA" && runners.map((r) => {
                  const index = exactaSelectedRunner.findIndex((runner) => runner.id === r.id);
                  const isSelected = index !== -1;
                  const badge = isSelected ? String(index + 1) : null;
                    return (
                    <RunnerButton
                        key={r.id}
                        condition={conditionById[r.id] || "NORMAL"}
                        runner={r}
                        isSelected={exactaSelectedRunner.some((runner) => runner.id === r.id)}
                        selectionBadge={badge}
                        disabled={phase !== "BETTING"}
                        onClick={() => toggleExactaSelectedRunner(r)}
                    />
                );})}
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
              <button className="bet_panel_total_bet_button" disabled={phase !== "BETTING"} onClick={onSetTotalBet}>全額賭ける</button>
            </div>
            <button className="bet_panel_submit_button" disabled={isSubmitDisabled} onClick={onSubmit}>確定</button>
          </div>
        
    );
}