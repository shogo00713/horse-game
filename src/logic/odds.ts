/**
 * オッズを、実際の勝率から逆算するロジック
 *
 * 調子で勝率が変わるため、オッズは「調子が分からない状態での、1着になる確率」から決める。
 * こうすると、調子が見えない人にとっては、どの馬の単勝も払い戻し率が同じ(RTP)になる
 */

import { CONDITION_DECK, applyCondition, type Condition } from "./condition";
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

// 調子の配り方の全パターン(同じ調子が複数あるので、重複を除いた並べ方)
export function dealPatterns(deck: Condition[]): Condition[][] {
  const sorted = [...deck].sort((a, b) => a - b);
  const result: Condition[][] = [];
  const used = new Array(sorted.length).fill(false);
  const current: Condition[] = [];

  function walk() {
    if (current.length === sorted.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue;
      // 同じ値の札は、先に使った札がある場合だけ使う(重複パターンを避ける)
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      current.push(sorted[i]);
      walk();
      current.pop();
      used[i] = false;
    }
  }

  walk();
  return result;
}

/**
 * 調子が分からない状態での、各馬の1着になる確率
 *
 * 調子の全パターンが同じ確率で起きるものとして平均を取る
 */
export function marginalWinProbabilities(strengths: number[]): number[] {
  const average = strengths.reduce((sum, w) => sum + w, 0) / strengths.length;
  const patterns = dealPatterns(CONDITION_DECK);
  const totals = new Array(strengths.length).fill(0);

  for (const pattern of patterns) {
    const weights = strengths.map((w, i) =>
      applyCondition(w, pattern[i] ?? 2, average),
    );
    const sum = weights.reduce((a, b) => a + b, 0);
    weights.forEach((w, i) => (totals[i] += w / sum));
  }

  return totals.map((t) => t / patterns.length);
}

const MIN_ODDS = 1.1;

/**
 * 強さから、表示するオッズ(単勝の倍率)を決める
 *
 * @param strengths 各馬の基本の強さ
 * @param rtp 払い戻し率(0.9なら、賭け金の平均80%が戻る)
 */
export function deriveOdds(strengths: number[], rtp: number): number[] {
  return marginalWinProbabilities(strengths).map((p) =>
    Math.max(MIN_ODDS, Math.round((rtp / p) * 10) / 10),
  );
}

// 着順の確率(重み付きで1頭ずつ選んでいく方式)で、指定した順に上位を占める確率
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
 * 調子が分からない状態での、そのベットが的中する確率
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

  const strengths = field.map(strengthOf);
  const average = strengths.reduce((a, b) => a + b, 0) / strengths.length;
  const picked = selected.map((r) => field.findIndex((f) => f.id === r.id));
  const others = field.map((_, i) => i).filter((i) => !picked.includes(i));

  // 上位 n 頭に入る/入らないの組み合わせごとの確率を、調子の全パターンで平均する
  const patterns = dealPatterns(CONDITION_DECK);
  let total = 0;

  for (const pattern of patterns) {
    const w = strengths.map((s, i) =>
      applyCondition(s, pattern[i] ?? 2, average),
    );

    switch (betType) {
      case "WIN":
      case "EXACTA":
      case "TRIFECTA":
        total += orderedProbability(w, picked);
        break;
      case "QUINELLA":
      case "TRIO":
        total += permutations(picked).reduce(
          (sum, order) => sum + orderedProbability(w, order),
          0,
        );
        break;
      case "PLACE": {
        // 3着以内に入る = 1着か、2着か、3着になる確率の合計
        const me = picked[0];
        let p = orderedProbability(w, [me]);
        for (const a of others) {
          p += orderedProbability(w, [a, me]);
          for (const b of others) {
            if (a !== b) p += orderedProbability(w, [a, b, me]);
          }
        }
        total += p;
        break;
      }
    }
  }

  const result =
    field.length <= 3 && betType === "PLACE" ? 1 : total / patterns.length;
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
