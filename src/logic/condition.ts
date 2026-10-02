/**
 * 馬の「調子」のロジック
 *
 * 調子は画面には出さない隠しパラメータ。レースごとに前の調子から確率的に遷移する
 * (オートマトン)ので、連続した過去の着順から「最近調子が良さそう」と推測できる。
 *
 * 調子は5段階(0: 絶不調 〜 4: 絶好調)。2が普通。
 */

import type { Runner } from "../types/game";

export type Condition = 0 | 1 | 2 | 3 | 4;

export const CONDITION_LEVELS = 5;
// 表示名(デバッグ表示用)
export const CONDITION_LABELS = ["絶不調", "不調", "普通", "好調", "絶好調"];

export const NORMAL_CONDITION: Condition = 2;

// 調子の割合(8頭あたりの枚数)。絶不調1・不調1・普通3・好調2・絶好調1
// 頭数に応じて比例して増える(16頭なら 絶不調2・不調2・普通6・好調4・絶好調2)
const DECK_RATIO_PER_8 = [1, 1, 3, 2, 1];

/**
 * 1レースごとに配られる調子の内訳(馬の数と同じ枚数)を、良い順に並べて返す
 *
 * 普通以外は割合どおりに四捨五入し、残りを普通にする
 */
export function conditionDeck(horseCount: number): Condition[] {
  const counts = DECK_RATIO_PER_8.map((c) => Math.round((horseCount * c) / 8));
  const others = counts[0] + counts[1] + counts[3] + counts[4];
  counts[2] = Math.max(0, horseCount - others);

  const deck: Condition[] = [];
  for (let level = 4; level >= 0; level--) {
    for (let i = 0; i < counts[level]; i++) deck.push(level as Condition);
  }
  return deck;
}

// 全馬ぶんの調子を、馬のIDごとにまとめた形
export type Conditions = Record<string, Condition>;

// 前のレースの調子を、どれだけ引き継ぐか(大きいほど入れ替わりやすい)
const CARRY_NOISE = 2.5;

/**
 * 全馬に調子を配る
 *
 * 配る内訳は毎回 conditionDeck のとおり(8頭なら 絶好調1・好調2・普通3・不調1・絶不調1)。
 * previous を渡すと、前のレースの調子が良かった馬ほど良い調子を引きやすくなる
 * (前の調子にランダムなゆらぎを足して並べ、良い順に内訳を配る)。
 * previous を省略すると、完全にランダムに配る
 *
 * 馬の数が内訳より多い場合、余った馬は「普通」になる
 */
export function dealConditions(
  runners: Runner[],
  previous?: Conditions,
  random: () => number = Math.random,
): Conditions {
  const deck = conditionDeck(runners.length); // 良い順

  const ranked = runners
    .map((r) => {
      const prevLevel = previous?.[r.id] ?? NORMAL_CONDITION;
      // previous が無いときは、前の調子を無視して完全にランダムにする
      const base = previous ? prevLevel : 0;
      const jitter = (random() * 2 - 1) * (previous ? CARRY_NOISE : 100);
      return { id: r.id, score: base + jitter };
    })
    .sort((x, y) => y.score - x.score);

  return Object.fromEntries(
    ranked.map((r, i) => [r.id, deck[i] ?? NORMAL_CONDITION]),
  );
}

// 保存データなどが正しい形か(全馬ぶん、0〜4の整数)
export function isValidConditions(
  value: unknown,
  runners: Runner[],
): value is Conditions {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return runners.every((r) => {
    const c = record[r.id];
    return (
      typeof c === "number" &&
      Number.isInteger(c) &&
      c >= 0 &&
      c < CONDITION_LEVELS
    );
  });
}

// 調子ごとの重みへの効き方
// 好調側は「全馬の平均の重み」に対する割合を足す(重みの小さい穴馬ほど効きが大きい)
// 不調側は掛け算で下げる(足し算だと重みがマイナスになりうるため)
const BONUS_RATE = [0, 0, 0, 0.5, 1.0]; // 平均の重みに対する加算の割合
const PENALTY_RATE = [0.6, 0.8, 1, 1, 1]; // 掛け算の倍率
const MIN_WEIGHT = 0.01;

export function applyCondition(
  baseWeight: number,
  condition: Condition,
  averageWeight: number,
): number {
  const weight =
    baseWeight * PENALTY_RATE[condition] +
    averageWeight * BONUS_RATE[condition];
  return Math.max(MIN_WEIGHT, weight);
}
