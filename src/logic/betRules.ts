/**
 * 賭け方ごとの選択馬数のルール
 *
 * 賭け方ごとに選択できる馬の頭数が異なるので、それを正しく判定する関数を提供する
 */

import type { BetType, BetSelection, Runner, Phase, Bet } from "../types/game";
import { calculateMaxPayout } from "./payout";

// 所持金リセットボタンを押せるかどうか
export function canResetMoney(phase: Phase, money: number): boolean {
  return phase === "BETTING" && money <= 500;
}

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

// 選んだ馬の表示用文字列。着順ありなら「1. A → 2. B」、なしなら「A / B」
export function formatSelectedRunners(bet: Bet): string {
  if (isOrderedBetType(bet.betType)) {
    return bet.selectedRunners.map((r, i) => `${i + 1}. ${r.name}`).join(" → ");
  }
  return bet.selectedRunners.map((r) => r.name).join(" / ");
}

// 賭け方の日本語表示
export function betTypeLabel(betType: BetType): string {
  switch (betType) {
    case "WIN":
      return "単勝";
    case "PLACE":
      return "複勝";
    case "TRIO":
      return "3連複";
    case "TRIFECTA":
      return "3連単";
    case "QUINELLA":
      return "馬連";
    case "EXACTA":
      return "馬単";
  }
}

// 1件のベットが「成立しているか」(馬を必要数選び、金額を入力しているか)
export function isValidBet(bet: Bet): boolean {
  const amount = Number(bet.betstr);
  return (
    amount > 0 && bet.selectedRunners.length === maxSelectable(bet.betType)
  );
}

// ベット全件の合計金額
export function totalBetAmount(bets: Bet[]): number {
  return bets.reduce((sum, bet) => sum + Number(bet.betstr), 0);
}

// 今のベット内容で「BETする」ボタンを押せるかどうか
// - 1件以上ある
// - 全件成立している(馬の数・金額が正しい)
// - 合計金額が所持金を超えていない
// 同じ組み合わせ(同じ馬・同じ賭け方)の重複登録は、意図的に禁止していない
export function canSubmitBets(bets: Bet[], money: number): boolean {
  return (
    bets.length > 0 && bets.every(isValidBet) && totalBetAmount(bets) <= money
  );
}

// ベット全件ぶんの「最大払戻額」(全部的中した場合の合計)。
// 馬・金額が未入力の未成立なベットは0として扱う
export function totalMaxPayout(bets: Bet[], field: Runner[]): number {
  return bets
    .filter(isValidBet)
    .reduce(
      (sum, bet) =>
        sum +
        calculateMaxPayout(
          Number(bet.betstr),
          buildBetSelection(bet.betType, bet.selectedRunners),
          field,
        ),
      0,
    );
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
