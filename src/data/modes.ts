/**
 * ゲームモード(出走頭数)の定義
 *
 * モードごとに、馬・履歴・調子を別々に保存する(所持金は共通)
 */

import type { Runner } from "../types/game";
import { runners8, runners16 } from "./runners";

export type GameMode = "8" | "16";

export const GAME_MODES: GameMode[] = ["8", "16"];

export const DEFAULT_MODE: GameMode = "8";

export type ModeConfig = {
  id: GameMode;
  label: string;
  description: string;
  runners: Runner[];
};

export const MODES: Record<GameMode, ModeConfig> = {
  "8": {
    id: "8",
    label: "8頭",
    description: "基本のモード。馬が少なく、予想しやすい",
    runners: runners8,
  },
  "16": {
    id: "16",
    label: "16頭",
    description: "大波乱モード。馬が多く、2000倍超えの大穴も",
    runners: runners16,
  },
};

export function isGameMode(value: unknown): value is GameMode {
  return value === "8" || value === "16";
}

// 保存データのキー。8頭モードは従来のキーのまま使い、他のモードは末尾にモード名を付ける
export function storageKey(base: string, mode: GameMode): string {
  return mode === DEFAULT_MODE ? base : `${base}:${mode}`;
}
