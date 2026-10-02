/**
 * レース履歴から、馬別の成績を集計するロジック
 */

import type { RaceHistory, Runner } from "../types/game";

// 履歴として残すレース数の上限
export const MAX_HISTORY = 20;

export type HorseStats = {
  runner: Runner;
  ranks: number[]; // 各レースでの着順(1始まり)。新しいレースが先頭
  average: number | null; // 平均着順(出走がなければnull)
  wins: number; // 1着の回数
  top3: number; // 3着以内の回数
};

export function horseStats(
  history: RaceHistory[],
  runners: Runner[],
): HorseStats[] {
  return runners.map((runner) => {
    const ranks = history
      .map((h) => h.result.findIndex((r) => r.id === runner.id) + 1)
      .filter((rank) => rank > 0);

    return {
      runner,
      ranks,
      average:
        ranks.length > 0
          ? ranks.reduce((sum, r) => sum + r, 0) / ranks.length
          : null,
      wins: ranks.filter((r) => r === 1).length,
      top3: ranks.filter((r) => r <= 3).length,
    };
  });
}
