/**
 * 賞金計算ロジック
 *
 * 配当は、単勝は馬のオッズ、それ以外は的中確率から決める(odds.ts)。
 * どの券種も、調子が分からない人にとっての払い戻し率は同じ(RTP)になる
 * - 単勝: 1着のオッズ
 * - 複勝: 3着以内に入る確率
 * - 馬連: 1・2着の2頭(順不同)になる確率
 * - 馬単: 1・2着の2頭(順番どおり)になる確率
 * - 3連複: 1〜3着の3頭(順不同)になる確率
 * - 3連単: 1〜3着の3頭(順番どおり)になる確率
 */

import { BetSelection, Runner } from "../types/game";
import { payoutMultiplier } from "./odds";

/**
 * 配当計算アルゴリズム本体
 *
 * selection.betTypeに応じて、各ベットタイプの計算関数を呼び出す
 *
 * @param bet
 * @param selection
 * @param result
 * @returns
 */
export function calculatePayout(
  bet: number,
  selection: BetSelection,
  result: Runner[],
): number {
  switch (selection.betType) {
    case "WIN":
      return calculateWinPayout(bet, selection.runner, result);
    case "PLACE":
      return calculatePlacePayout(bet, selection.runner, result);
    case "TRIO":
      return calculateTrioPayout(bet, selection.runners, result);
    case "TRIFECTA":
      return calculateTrifectaPayout(bet, selection.runners, result);
    case "QUINELLA":
      return calculateQuinellaPayout(bet, selection.runners, result);
    case "EXACTA":
      return calculateExactaPayout(bet, selection.runners, result);
  }
}

/**
 * 的中した場合の払戻額(最大払戻額)を計算する
 *
 * calculatePayoutと違い、着順を必要としない(的中/非的中の判定を行わない)。
 * ベット内容から「もし当たったらいくらになるか」だけを計算する
 *
 * @param field 出走馬全員(的中確率の計算に使う)
 */
export function calculateMaxPayout(
  bet: number,
  selection: BetSelection,
  field: Runner[],
): number {
  return Math.floor(calculateOdds(selection, field) * bet);
}

// 的中可否に関わらない、ベット内容そのもののオッズ倍率
// 単勝は馬のオッズ、それ以外は的中確率から「払い戻し率 ÷ 的中確率」で決める
function calculateOdds(selection: BetSelection, field: Runner[]): number {
  switch (selection.betType) {
    case "WIN":
      return selection.runner.odds;
    case "PLACE":
      return payoutMultiplier("PLACE", [selection.runner], field);
    case "TRIO":
    case "TRIFECTA":
    case "QUINELLA":
    case "EXACTA":
      return payoutMultiplier(selection.betType, selection.runners, field);
  }
}

// 順序を考慮した一致判定
function isSameOrder(
  selected: Runner[],
  result: Runner[],
  count: number,
): boolean {
  const selectedIds = selected.map((r) => r.id);
  const resultIds = result.slice(0, count).map((r) => r.id);
  return selectedIds.every((id, i) => id === resultIds[i]);
}

// 順序を考慮しない一致判定
function isSameCombination(
  selected: Runner[],
  result: Runner[],
  count: number,
): boolean {
  if (selected.length !== count) return false;

  const selectedIds = selected.map((r) => r.id).sort();
  const resultIds = result
    .slice(0, count)
    .map((r) => r.id)
    .sort();
  return selectedIds.every((id, i) => id === resultIds[i]);
}

// 単勝計算
function calculateWinPayout(
  bet: number,
  selected: Runner,
  result: Runner[],
): number {
  const isHit = isSameOrder([selected], result, 1);
  return isHit
    ? calculateMaxPayout(bet, { betType: "WIN", runner: selected }, result)
    : 0;
}

// 複勝計算
function calculatePlacePayout(
  bet: number,
  selected: Runner,
  result: Runner[],
): number {
  const isHit = result.slice(0, 3).some((r) => r.id === selected.id);
  return isHit
    ? calculateMaxPayout(bet, { betType: "PLACE", runner: selected }, result)
    : 0;
}

// 3連復計算
function calculateTrioPayout(
  bet: number,
  threeSelected: [Runner, Runner, Runner],
  result: Runner[],
): number {
  const isHit = isSameCombination(threeSelected, result, 3);
  return isHit
    ? calculateMaxPayout(
        bet,
        { betType: "TRIO", runners: threeSelected },
        result,
      )
    : 0;
}

// 3連単計算
function calculateTrifectaPayout(
  bet: number,
  threeSelected: [Runner, Runner, Runner],
  result: Runner[],
): number {
  const isHit = isSameOrder(threeSelected, result, 3);
  return isHit
    ? calculateMaxPayout(
        bet,
        { betType: "TRIFECTA", runners: threeSelected },
        result,
      )
    : 0;
}

// 馬連計算
function calculateQuinellaPayout(
  bet: number,
  twoSelected: [Runner, Runner],
  result: Runner[],
): number {
  const isHit = isSameCombination(twoSelected, result, 2);
  return isHit
    ? calculateMaxPayout(
        bet,
        { betType: "QUINELLA", runners: twoSelected },
        result,
      )
    : 0;
}

// 馬単計算
function calculateExactaPayout(
  bet: number,
  twoSelected: [Runner, Runner],
  result: Runner[],
): number {
  const isHit = isSameOrder(twoSelected, result, 2);
  return isHit
    ? calculateMaxPayout(
        bet,
        { betType: "EXACTA", runners: twoSelected },
        result,
      )
    : 0;
}
