import type { Runner } from "../types/game";

type RunnerButtonProps = {
  runner: Runner;
  isSelected: boolean;
  selectionBadge?: string | null;
  disabled: boolean;
  onClick: () => void;
};

export default function RunnerButton({
  runner,
  isSelected,
  selectionBadge,
  disabled,
  onClick,
}: RunnerButtonProps) {
  return (
    <button
      type="button"
      className={isSelected ? "runner runner--selected" : "runner"}
      disabled={disabled}
      onClick={onClick}
    >
      {selectionBadge && <span className="runnerBadge">{selectionBadge}</span>}

      <div className="runnerName">{runner.name}</div>

      <div className="runnerOdds">Odds {runner.odds.toFixed(1)}</div>
    </button>
  );
}
