/**
 * 抽選演出(レースの進行に合わせて、順位が前後しながら最終順位に収束していく)のロジック
 *
 * 結果は go() の時点で確定済み。ここでは「途中経過の見せ方」だけを決める
 */

import type { Runner } from "../types/game";

// 演出全体の長さ(この時間が経つと PAYOUT に進む)
export const DRAW_DURATION_MS = 7000;

// 進捗がここを超えると、順位の入れ替わりは止まり最終順位で固定される
export const SETTLE_PROGRESS = 0.9;

// 経過時間から、レースの進捗(0〜1)を返す
export function progressAt(elapsedMs: number): number {
  return Math.min(1, Math.max(0, elapsedMs / DRAW_DURATION_MS));
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * 1回のレースぶんの「途中経過の台本」を作る
 *
 * 返り値は、進捗(0〜1)を渡すとその時点の順位順(1位が先頭)の馬を返す関数。
 * 各馬のスコアは「最終順位に応じた成分」+「揺れ(複数の波)」でできていて、
 * 揺れは進捗とともに小さくなり、SETTLE_PROGRESS で0になる。
 * そのため序盤は順位が入れ替わり続け、終盤は最終順位(result)に必ず収束する
 */
export function createRaceScript(
  result: Runner[],
  random: () => number = Math.random,
): (progress: number) => Runner[] {
  const n = result.length;

  const horses = result.map((runner, rank) => ({
    runner,
    finalScore: n - rank,
    waves: Array.from({ length: 3 }, () => ({
      freq: 0.5 + random() * 1.0,
      phase: random() * Math.PI * 2,
    })),
  }));

  return (progress) => {
    const p = clamp01(progress);
    const pace = p * p * (3 - 2 * p); // 最終順位の成分が効いてくる度合い
    const settle = clamp01(p / SETTLE_PROGRESS);
    const wobble = n * 0.2 * (1 - settle * settle); // 揺れの大きさ(終盤に向けて収まる)

    return horses
      .map((h) => {
        const noise =
          h.waves.reduce(
            (sum, w) => sum + Math.sin(w.freq * Math.PI * 2 * p + w.phase),
            0,
          ) / h.waves.length;
        return { h, score: h.finalScore * pace + noise * wobble };
      })
      .sort((a, b) => b.score - a.score || b.h.finalScore - a.h.finalScore)
      .map(({ h }) => h.runner);
  };
}
