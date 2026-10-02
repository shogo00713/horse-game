// このゲームの中で使用する型定義をまとめたファイル

// ゲームの進行フェーズ
export type Phase = "BETTING" | "DRAWING" | "PAYOUT";

// ベットの種類
export type BetType =
  "WIN" | "PLACE" | "TRIO" | "TRIFECTA" | "QUINELLA" | "EXACTA";

// 各ベットの選択肢
export type BetSelection =
  | { betType: "WIN"; runner: Runner }
  | { betType: "PLACE"; runner: Runner }
  | { betType: "QUINELLA"; runners: [Runner, Runner] }
  | { betType: "EXACTA"; runners: [Runner, Runner] }
  | { betType: "TRIO"; runners: [Runner, Runner, Runner] }
  | { betType: "TRIFECTA"; runners: [Runner, Runner, Runner] };

// レースの履歴
export type RaceHistory = {
  raceNo: number; // 第n戦
  result: Runner[]; // 着順
};

// 1件分のベット(同一レースに対して複数件、同時に持てる)
export type Bet = {
  id: string;
  betType: BetType;
  selectedRunners: Runner[];
  betstr: string;
};

// 1件分のベットの払い戻し結果
export type BetResult = {
  bet: Bet;
  payout: number;
};

// 馬の情報
export interface Runner {
  id: string;
  name: string;
  odds: number;
}
