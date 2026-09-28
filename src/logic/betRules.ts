/**
 * 賭け方ごとの選択馬数のルール
 *
 * 賭け方ごとに選択できる馬の頭数が異なるので、それを正しく判定する関数を提供する
 */

import type { BetType, BetSelection, Runner } from "../types/game";

// 賭け方ごとに選択できる馬の頭数
export function maxSelectable(betType: BetType): number {
  switch (betType) {
    case "WIN":
    case "PLACE":
      return 1;
    case "QUINELLA":
    case "EXACTA":
      return 2;
    case "TRIO":
    case "TRIFECTA":
      return 3;
  }
}

// 着順を当てる必要がある賭け方か
export function isOrderedBetType(betType: BetType): boolean {
  return betType === "TRIFECTA" || betType === "EXACTA";
}

// betType + 選択済みの馬から、payout計算用の BetSelection を組み立てる
export function buildBetSelection(
  betType: BetType,
  selectedRunners: Runner[],
): BetSelection {
  switch (betType) {
    case "WIN":
    case "PLACE":
      return { betType, runner: selectedRunners[0] };
    case "TRIO":
    case "TRIFECTA":
      return {
        betType,
        runners: selectedRunners as [Runner, Runner, Runner],
      };
    case "QUINELLA":
    case "EXACTA":
      return {
        betType,
        runners: selectedRunners as [Runner, Runner],
      };
  }
}
