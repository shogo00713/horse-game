// このゲームの中で使用する型定義をまとめたファイル

// ゲームの進行フェーズ
export type Phase     = "BETTING" | "DRAWING" | "PAYOUT";

// ベットの種類
export type BetType   = "WIN" | "PLACE" | "TRIO" | "TRIFECTA" | "QUINELLA" | "EXACTA";

// 各ベットの選択肢
export type BetSelection =
  | { betType: "WIN";      runner : Runner }
  | { betType: "PLACE";    runner : Runner }
  | { betType: "QUINELLA"; runners: [Runner, Runner] }
  | { betType: "EXACTA";   runners: [Runner, Runner] }
  | { betType: "TRIO";     runners: [Runner, Runner, Runner] }
  | { betType: "TRIFECTA"; runners: [Runner, Runner, Runner] };

// 馬の調子
export type Condition = "HOT" | "NORMAL" | "COLD";

// レースの履歴
export type RaceHistory = {
  raceNo: number;                        // 第n戦
  result: Runner[];                      // 着順
  conditions: Record<string, Condition>; // そのレース時の調子
};

// 馬の情報
export interface Runner {
  id  : string;
  name: string;
  odds: number;
}