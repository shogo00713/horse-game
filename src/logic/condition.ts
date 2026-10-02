/**
 * 馬の「調子」のロジック
 *
 * 調子は画面には出さない隠しパラメータ。レースごとに、隣り合う調子の馬どうしが
 * 入れ替わる形でゆっくり遷移する(オートマトン)。各調子の頭数は変わらない。
 * 数レース続くので、連続した過去の着順から「最近調子が良さそう」と推測できる。
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

// 隣り合う調子の入れ替わりやすさ(1レースあたり)
// 添字は下側の調子: [絶不調↔不調 20%, 不調↔普通 30%, 普通↔好調 30%, 好調↔絶好調 20%]
// 上側の調子の馬1頭ごとに、この確率で下側の馬と入れ替わる
export const SWAP_PROBABILITY = [0.2, 0.3, 0.3, 0.2];

/** 全馬にランダムに調子を配る(最初のレース用) */
function dealRandomConditions(
  runners: Runner[],
  random: () => number,
): Conditions {
  const deck = conditionDeck(runners.length);

  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return Object.fromEntries(
    runners.map((r, i) => [r.id, deck[i] ?? NORMAL_CONDITION]),
  );
}

/**
 * 全馬の調子を決める
 *
 * previous が無ければ、内訳(conditionDeck)をシャッフルして配る。
 *
 * previous があれば、前のレースの調子から「入れ替え」で次の調子にする。
 * 上側の調子の馬それぞれが SWAP_PROBABILITY の確率で、1つ下の調子の馬と入れ替わる
 * (好調 ↔ 絶好調 は20%、普通 ↔ 好調 は30%、…)。
 * 入れ替えなので各調子の頭数は変わらず、1頭が1レースで動くのは最大1段階。
 */
export function dealConditions(
  runners: Runner[],
  previous?: Conditions,
  random: () => number = Math.random,
): Conditions {
  if (!previous) return dealRandomConditions(runners, random);

  const next: Conditions = { ...previous };
  const swapped = new Set<string>(); // 今回すでに入れ替わった馬(連続で動かさない)

  // 上の調子から順に、隣の調子との入れ替えを行う
  for (let upper = CONDITION_LEVELS - 1; upper >= 1; upper--) {
    const lower = upper - 1;
    const probability = SWAP_PROBABILITY[lower];

    for (const runner of runners) {
      if (next[runner.id] !== upper || swapped.has(runner.id)) continue;
      if (random() >= probability) continue;

      // 下側の調子で、まだ動いていない馬から1頭を選んで入れ替える
      const candidates = runners.filter(
        (r) => next[r.id] === lower && !swapped.has(r.id),
      );
      if (candidates.length === 0) continue;
      const partner = candidates[Math.floor(random() * candidates.length)];

      next[runner.id] = lower as Condition;
      next[partner.id] = upper as Condition;
      swapped.add(runner.id);
      swapped.add(partner.id);
    }
  }

  return next;
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

// 調子ごとの重みへの効き方(掛け算の倍率)
// 倍率が大きいほど、調子が結果を左右する。絶好調は上位に来やすく、絶不調はほぼ来ない
const MULTIPLIERS = [0.05, 0.2, 1, 5, 8];
const MIN_WEIGHT = 1e-6;

/** 基本の重みに調子の倍率を掛ける */
export function applyCondition(
  baseWeight: number,
  condition: Condition,
): number {
  return Math.max(MIN_WEIGHT, baseWeight * MULTIPLIERS[condition]);
}
