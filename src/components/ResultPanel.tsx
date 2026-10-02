/**
 * 着順を表示するコンポーネント
 *
 * phaseに応じて表示内容が変わる
 *  - BETTING: 着順は非表示、前回結果のみ表示
 *  - DRAWING: 着順は非表示、前回結果も非表示
 *  - PAYOUT: 着順を表示、前回結果も表示
 */

import type { Phase, Runner } from "../types/game";
import styles from "./ResultPanel.module.css";

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
      return "ベット受付中";
    case "DRAWING":
      return "抽選中";
    case "PAYOUT":
      return "払い戻し中";
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
    <div className={styles.resultPanel}>
      <div className={styles.phaseMessage}>現在 : {phaseMessage(phase)}</div>

      <div className={styles.mainTitle}>着順</div>

      <div className={styles.finishLines}>
        {/* 今回の着順を表示する部分 */}
        {runners.map((runner, i) => {
          const rank = i + 1;
          const isSelected =
            phase === "PAYOUT" && selectedIds?.includes(result?.[i]?.id);

          return (
            <div
              key={runner.id}
              data-testid="finish-line"
              className={
                isSelected
                  ? `${styles.finishLine} ${styles.finishLineSelected}`
                  : styles.finishLine
              }
            >
              <span
                className={`${styles.finishRank} ${styles[`finishRank${rank}`] ?? ""}`}
              >
                {rank}位:
              </span>
              <span
                className={`${styles.finishName} ${styles[`finishName${rank}`] ?? ""}`}
              >
                {phase === "PAYOUT" ? (result?.[i]?.name ?? "-") : "-"}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.previousResult}>
        <div className={styles.previousResultTitle}>前回結果</div>
        <div className={styles.previousResultLines}>
          {/* 前回の着順を表示する部分 */}
          {runners.map((_, rank) => (
            <div
              key={rank}
              data-testid="previous-result-line"
              className={styles.previousResultLine}
            >
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
