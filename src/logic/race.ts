/**
 * レースの進行ロジック
 *
 * レースでは、各馬のオッズに基づいて着順を決定する
 *
 */

import { Runner } from "../types/game";

/**
 * ランダムに1頭の馬を選ぶ関数
 *
 * 重みに応じてランダムに1頭の馬を選ぶ
 * Math.random() に基づくランダム選出
 *
 * @param pool
 * @param weighted
 * @returns
 */
export function pickWinnerByOdds(
  pool: Runner[],
  weighted: { runner: Runner; weight: number }[],
): Runner {
  // pool に残っている馬だけから重みを抽出する
  const poolWeighted = weighted.filter((w) =>
    pool.some((r) => r.id === w.runner.id),
  );
  // 重みの合計を計算しそこまでの値から乱数を生成し、該当範囲の馬を選ぶ
  const total = poolWeighted.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;

  for (const w of poolWeighted) {
    r -= w.weight;
    if (r <= 0) return w.runner;
  }
  return poolWeighted[poolWeighted.length - 1].runner;
}

/**
 * レースの着順を決定する関数
 *
 * 馬に重みをつけた後、ランダムに1頭ずつ選んで着順を決定する
 *
 * @param runners
 * @returns
 */
export function makeFinishOrder(runners: Runner[]): Runner[] {
  // 各馬に重みを付ける(オッズの逆数の比)
  const weighted = runners.map((r) => ({ runner: r, weight: 1 / r.odds }));

  let pool = [...runners];
  const finish: Runner[] = [];

  while (pool.length > 0) {
    const winner = pickWinnerByOdds(pool, weighted);
    finish.push(winner);
    pool = pool.filter((r) => r.id !== winner.id);
  }
  return finish;
}
