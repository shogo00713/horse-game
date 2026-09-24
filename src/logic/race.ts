/**
 * レースの進行ロジック
 * 
 * レースでは、各馬のオッズや調子に基づいて着順を決定する
 * 
 */


import { Runner } from "../types/game";
import { Condition } from "../types/game";

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
  weighted: { runner: Runner; weight: number }[]
): Runner {

  // pool に残っている馬だけから重みを抽出する
  const poolWeighted = weighted.filter((w) =>
    pool.some((r) => r.id === w.runner.id)
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
 * @param conditions 
 * @returns 
 */
export function makeFinishOrder(
  runners: Runner[],
  conditions: Record<string, Condition>
): Runner[] {

    // 各馬に重みを付ける
    // 基本的にはオッズの逆数の比となるが、調子によって補正する
    // HOT: +0.6, NORMAL: +0.2, COLD: +0
    const weighted = runners.map((r) => {
        const base = 1 / r.odds;
        const mod = conditions[r.id] === "HOT" ? 0.6
                    : conditions[r.id] === "COLD" ? 0
                    : 0.2;
        return { runner: r, weight: base + mod };
    });
    
    let pool = [...runners];
    const finish: Runner[] = [];

    while (pool.length > 0) {const winner = pickWinnerByOdds(pool, weighted);
        finish.push(winner);
        pool = pool.filter(r => r.id !== winner.id);
    }
    return finish;
}