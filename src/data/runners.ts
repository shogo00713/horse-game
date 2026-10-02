/**
 * 馬のデータ
 *
 * 馬の「強さ」から、実際の勝率に合ったオッズを自動で計算する。
 * 強さの目安(rating)は、小さいほど強い(従来のオッズと同じ感覚で書いてある)
 */

import type { Runner } from "../types/game";
import { deriveOdds, RTP_BY_TYPE } from "../logic/odds";

// 強さの差の付き方。1より小さいほど差が縮まり、大穴が来やすくなる
const STRENGTH_EXPONENT = 0.7;

const BASE_RUNNERS = [
  { id: "1", name: "フェニックス", rating: 1.2 },
  { id: "2", name: "ストームエッジ", rating: 2.0 },
  { id: "3", name: "サンダーボルト", rating: 3.0 },
  { id: "4", name: "花鳥風月", rating: 5.0 },
  { id: "5", name: "ナイトメア", rating: 10.0 },
  { id: "6", name: "スカイライン", rating: 10.0 },
  { id: "7", name: "エクスプレス", rating: 20.0 },
  { id: "8", name: "漆黒", rating: 25.0 },
];

const strengths = BASE_RUNNERS.map((r) =>
  Math.pow(1 / r.rating, STRENGTH_EXPONENT),
);
const odds = deriveOdds(strengths, RTP_BY_TYPE.WIN);

export const runners: Runner[] = BASE_RUNNERS.map((r, i) => ({
  id: r.id,
  name: r.name,
  odds: odds[i],
  strength: strengths[i],
}));
