/**
 * 着順を表示するコンポーネント
 *
 * phaseに応じて表示内容が変わる
 *  - BETTING: 着順は非表示、前回結果のみ表示
 *  - DRAWING: 着順は非表示、前回結果も非表示
 *  - PAYOUT: 着順を表示、前回結果も表示
 */

import { useEffect, useState } from "react";
import type { Phase, Runner } from "../types/game";
import {
  createRaceScript,
  progressAt,
  SETTLE_PROGRESS,
} from "../logic/drawAnimation";
import styles from "./ResultPanel.module.css";

// 親コンポーネントから渡されるprops
type ResultPanelProps = {
  phase: Phase;
  runners: Runner[];
  result: Runner[];
  previousResult: Runner[];
  betMarks: Record<string, number[]>; // 馬のID → その馬を選んでいるBETの番号
  maxBets?: number; // BETの最大件数(印の列の数)
  onSkip: () => void;
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

// phaseに応じた、遊び方の短い説明を返す
function phaseGuide(phase: Phase): string {
  switch (phase) {
    case "BETTING":
      return "右のBETパネルで賭けを決めて「BETする」を押すと、レースがスタート！";
    case "DRAWING":
      return "レース中…結果が出るまで固唾をのんで見守ろう！";
    case "PAYOUT":
      return "結果発表！当たったベットは右で払い戻しを受け取ろう。";
  }
}

// BET1〜BETnの印を、番号ごとに決まった列へ並べる(縦に見て、どのBETか分かるように)
// 選んでいないBETの列は、空のまま幅だけ確保する
function BetMarkSlots({
  marks,
  count,
  className,
}: {
  marks: number[];
  count: number;
  className: string;
}) {
  return (
    <span className={styles.markSlots}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.markSlot}>
          {marks.includes(i + 1) && (
            <span className={className}>BET{i + 1}</span>
          )}
        </span>
      ))}
    </span>
  );
}

export default function ResultPanel({
  phase,
  runners,
  result,
  previousResult,
  betMarks,
  maxBets = 5,
  onSkip,
}: ResultPanelProps) {
  // 抽選演出用: レースの進捗(0〜1)と、その時点の順位順の並び
  // 結果(result)は既に確定していて、ここでは途中経過の見せ方だけを変える
  const [progress, setProgress] = useState(0);
  const [drawOrder, setDrawOrder] = useState<Runner[] | null>(null);

  useEffect(() => {
    if (phase !== "DRAWING") return;
    const orderAt = createRaceScript(result);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const p = progressAt(Date.now() - startedAt);
      setProgress(p);
      setDrawOrder(orderAt(p));
    }, 100);
    return () => {
      clearInterval(timer);
      setDrawOrder(null);
      setProgress(0);
    };
  }, [phase, result]);

  const isDrawing = phase === "DRAWING";

  // 選んだ馬をハイライトする用のID

  return (
    <div className={styles.resultPanel}>
      <div className={styles.header}>
        <div className={styles.mainTitle}>RACE</div>
        <div className={styles.phaseMessage}>現在 : {phaseMessage(phase)}</div>
        <p className={styles.guide}>{phaseGuide(phase)}</p>
      </div>

      <div className={styles.sectionTitle}>着順</div>

      {isDrawing && (
        <div
          className={styles.raceProgress}
          role="progressbar"
          aria-label="レースの進行"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span className={styles.raceProgressLabel}>スタート</span>
          <div className={styles.raceProgressTrack}>
            <div
              className={styles.raceProgressFill}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className={styles.raceProgressLabel}>ゴール</span>
        </div>
      )}

      <div className={styles.finishLines}>
        {/* 今回の着順を表示する部分 */}
        {runners.map((runner, i) => {
          const rank = i + 1;
          const rowMarks =
            phase === "PAYOUT" ? (betMarks[result?.[i]?.id] ?? []) : [];
          const isSelected = rowMarks.length > 0;
          // 演出中は、名前はプレート側に出すので、枠の中は空にしておく
          const shownName =
            phase === "PAYOUT"
              ? (result?.[i]?.name ?? "-")
              : isDrawing
                ? ""
                : "-";

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
                {shownName}
              </span>
              {phase === "PAYOUT" && (
                <BetMarkSlots
                  marks={rowMarks}
                  count={maxBets}
                  className={styles.rowTag}
                />
              )}
            </div>
          );
        })}

        {/* 演出中: 名前入りのプレートが、固定の順位枠の上を移動する */}
        {isDrawing &&
          drawOrder?.map((runner, rank) => {
            const marks = betMarks[runner.id] ?? [];
            const isMine = marks.length > 0;
            const isSettled = progress >= SETTLE_PROGRESS;
            return (
              <div
                key={runner.id}
                data-testid="runner-plate"
                data-rank={rank + 1}
                className={[
                  styles.plate,
                  isMine && styles.plateMine,
                  isSettled && styles.plateSettled,
                  isSettled && rank === 0 && styles.plateWinner,
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  transform: `translateY(calc(${rank} * (var(--row-h) + var(--row-gap))))`,
                }}
              >
                <span>{runner.name}</span>
                <BetMarkSlots
                  marks={marks}
                  count={maxBets}
                  className={styles.plateTag}
                />
              </div>
            );
          })}
      </div>

      {isDrawing && (
        <button type="button" className={styles.skipButton} onClick={onSkip}>
          結果へスキップ
        </button>
      )}

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
