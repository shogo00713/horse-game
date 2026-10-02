/**
 * オッズと配当を、勝率・的中確率の「近似」から決めるロジック
 *
 * 調子で勝率が変わるが、厳密には計算しない。
 * 各馬の重みを「調子ごとの重みの平均」に置き換えて、着順の決め方
 * (重み付きで1頭ずつ選ぶ)をそのまま当てはめる。頭数が多くても軽く、
 * 調子が分からない人の期待値は、ほぼ払い戻し率に近くなる
 */

import { conditionDeck, applyCondition } from "./condition";
import type { BetType, Runner } from "../types/game";

// 券種ごとの払い戻し率(調子が分からない人が、平均して戻る割合)
// 1を超えてもよい。手堅い券種は低く、当たりにくい券種は高くして、券種ごとの個性を出す
export const RTP_BY_TYPE: Record<BetType, number> = {
  PLACE: 0.85,
  WIN: 0.9,
  QUINELLA: 0.95,
  EXACTA: 1.0,
  TRIO: 1.0,
  TRIFECTA: 1.1,
};

const MIN_ODDS = 1.1;

/**
 * 調子を平均した、各馬の重み
 *
 * 全馬の調子の内訳(conditionDeck)のうち、1頭が引く調子は等確率とみなして平均する
 */
export function expectedWeights(strengths: number[]): number[] {
  const deck = conditionDeck(strengths.length);
  const average = strengths.reduce((sum, w) => sum + w, 0) / strengths.length;

  return strengths.map(
    (s) =>
      deck.reduce<number>(
        (sum, level) => sum + applyCondition(s, level, average),
        0,
      ) / deck.length,
  );
}

/** 調子が分からない状態での、各馬の1着になる確率(近似) */
export function marginalWinProbabilities(strengths: number[]): number[] {
  const weights = expectedWeights(strengths);
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / total);
}

/**
 * 強さから、表示するオッズ(単勝の倍率)を決める
 *
 * @param strengths 各馬の基本の強さ
 * @param rtp 払い戻し率(0.9なら、賭け金の平均90%が戻る)
 */
export function deriveOdds(strengths: number[], rtp: number): number[] {
  return marginalWinProbabilities(strengths).map((p) =>
    Math.max(MIN_ODDS, Math.round((rtp / p) * 10) / 10),
  );
}

// 着順の確率(重み付きで1頭ずつ選ぶ方式)で、指定した順に上位を占める確率
function orderedProbability(weights: number[], order: number[]): number {
  let remaining = weights.reduce((a, b) => a + b, 0);
  let p = 1;
  for (const i of order) {
    p *= weights[i] / remaining;
    remaining -= weights[i];
  }
  return p;
}

// 配列の並べ方をすべて列挙する
function permutations(items: number[]): number[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((x, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [
      x,
      ...rest,
    ]),
  );
}

// 計算結果のキャッシュ(画面の再描画のたびに計算し直さないため)
const hitProbabilityCache = new Map<string, number>();

/**
 * 調子が分からない状態での、そのベットが的中する確率(近似)
 *
 * @param betType 賭け方
 * @param selected 選んだ馬
 * @param field 出走馬全員
 */
export function hitProbability(
  betType: BetType,
  selected: Runner[],
  field: Runner[],
): number {
  const strengthOf = (r: Runner) => r.strength ?? 1 / r.odds;
  const key = [
    betType,
    selected.map((r) => r.id).join(","),
    field.map((r) => `${r.id}:${strengthOf(r)}`).join(","),
  ].join("|");
  const cached = hitProbabilityCache.get(key);
  if (cached !== undefined) return cached;

  const weights = expectedWeights(field.map(strengthOf));
  const picked = selected.map((r) => field.findIndex((f) => f.id === r.id));
  const others = field.map((_, i) => i).filter((i) => !picked.includes(i));

  let result: number;
  switch (betType) {
    case "WIN":
    case "EXACTA":
    case "TRIFECTA":
      result = orderedProbability(weights, picked);
      break;
    case "QUINELLA":
    case "TRIO":
      result = permutations(picked).reduce(
        (sum, order) => sum + orderedProbability(weights, order),
        0,
      );
      break;
    case "PLACE": {
      // 3着以内に入る = 1着か、2着か、3着になる確率の合計
      const me = picked[0];
      if (field.length <= 3) {
        result = 1;
        break;
      }
      result = orderedProbability(weights, [me]);
      for (const a of others) {
        result += orderedProbability(weights, [a, me]);
        for (const b of others) {
          if (a !== b) result += orderedProbability(weights, [a, b, me]);
        }
      }
      break;
    }
  }

  hitProbabilityCache.set(key, result);
  return result;
}

/**
 * 的中確率から決めた、そのベットの配当倍率(賭け金に対する倍率)
 *
 * 券種ごとの払い戻し率になるように、「払い戻し率 ÷ 的中確率」とする(0.1刻み)。
 * 上限は設けない(当たりにくい組み合わせは、非常に高い配当になる)
 */
export function payoutMultiplier(
  betType: BetType,
  selected: Runner[],
  field: Runner[],
): number {
  const p = hitProbability(betType, selected, field);
  return Math.max(MIN_ODDS, Math.round((RTP_BY_TYPE[betType] / p) * 10) / 10);
}
