/**
 * 着順を表示するコンポーネント
 *
 * phaseに応じて表示内容が変わる
 *  - BETTING: 着順は非表示、前回結果のみ表示
 *  - DRAWING: 着順は非表示、前回結果も非表示
 *  - PAYOUT: 着順を表示、前回結果も表示
 */

import type { Phase, Runner } from "../types/game";

// 親コンポーネントから渡されるprops
type ResultPanelProps = {
  phase: Phase;
  runners: Runner[];
  result: Runner[];
  previousResult: Runner[];
  selectedRunners: Runner[];
};

// phaseに応じて表示するメッセージを返す
function phaseMessage(phase: Phase): string {
  switch (phase) {
    case "BETTING":
      return "ベット受付中!!";
    case "DRAWING":
      return "抽選中…";
    case "PAYOUT":
      return "結果発表！";
  }
}

export default function ResultPanel({
  phase,
  runners,
  result,
  previousResult,
  selectedRunners,
}: ResultPanelProps) {
  // 選んだ馬をハイライトする用のID
  const selectedIds = selectedRunners.map((runner) => runner.id);

  return (
    <div className="result_panel">
      <div className="phaseMessage">現在 : {phaseMessage(phase)}</div>

      <div className="mainTitle">着順</div>

      <div className="finishLines">
        {/* 今回の着順を表示する部分 */}
        {runners.map((runner, i) => (
          <div
            key={runner.id}
            className={
              phase === "PAYOUT" && selectedIds?.includes(result?.[i]?.id)
                ? "finishLine finishLine--selected"
                : "finishLine"
            }
          >
            <span className={`finishRank finishRank--${i + 1}`}>
              {i + 1}位:
            </span>
            <span className={`finishName finishName--${i + 1}`}>
              {phase === "PAYOUT" ? (result?.[i]?.name ?? "-") : "-"}
            </span>
          </div>
        ))}
      </div>

      <div className="previous_result">
        <div className="previous_result_title">前回結果</div>
        <div className="previous_result_lines">
          {/* 前回の着順を表示する部分 */}
          {runners.map((_, rank) => (
            <div key={rank} className="previous_result_line">
              {rank + 1}位:{" "}
              {phase !== "DRAWING"
                ? (previousResult?.[rank]?.name ?? "-")
                : "-"}
              {/* 最後の馬以外はカンマを表示する */}
              {rank < runners.length - 1 ? " ," : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
