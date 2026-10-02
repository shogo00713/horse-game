/**
 * 馬のデータ(8頭・16頭の2種類)
 *
 * 馬の「強さ」から、勝率に合ったオッズを自動で計算する(近似)。
 * 強さの目安(rating)は、小さいほど強い(従来のオッズと同じ感覚で書いてある)
 */

import type { Runner } from "../types/game";
import { deriveOdds, RTP_BY_TYPE } from "../logic/odds";

// 強さの差の付き方。1より小さいほど差が縮まり、大穴が来やすくなる
const STRENGTH_EXPONENT = 0.7;

type BaseRunner = {
  id: string;
  name: string;
  rating: number;
  description: string;
};

// 強さの目安からオッズを計算して、ゲームで使う馬のデータにする
function buildRunners(base: BaseRunner[]): Runner[] {
  const strengths = base.map((r) => Math.pow(1 / r.rating, STRENGTH_EXPONENT));
  const odds = deriveOdds(strengths, RTP_BY_TYPE.WIN);

  return base.map((r, i) => ({
    id: r.id,
    name: r.name,
    odds: odds[i],
    description: r.description,
    strength: strengths[i],
  }));
}

// ----- 8頭モード -----
export const runners8: Runner[] = buildRunners([
  {
    id: "1",
    name: "フェニックス",
    rating: 1.2,
    description: "圧倒的なスピードで駆け抜ける本命馬",
  },
  {
    id: "2",
    name: "ストームエッジ",
    rating: 2.0,
    description: "安定した走りで上位を狙う",
  },
  {
    id: "3",
    name: "サンダーボルト",
    rating: 3.0,
    description: "末脚に期待の実力馬",
  },
  {
    id: "4",
    name: "花鳥風月",
    rating: 5.0,
    description: "波乱を呼ぶダークホース",
  },
  {
    id: "5",
    name: "ナイトメア",
    rating: 10.0,
    description: "一発の魅力を秘める",
  },
  {
    id: "6",
    name: "スカイライン",
    rating: 10.0,
    description: "堅実な走りで連対圏内",
  },
  {
    id: "7",
    name: "エクスプレス",
    rating: 20.0,
    description: "スピード自慢の逃げ馬",
  },
  { id: "8", name: "漆黒", rating: 25.0, description: "大穴で一発を狙う" },
]);

// ----- 16頭モード -----
export const runners16: Runner[] = buildRunners([
  {
    id: "1",
    name: "フェニックス",
    rating: 1.5,
    description: "圧倒的なスピードで駆け抜ける本命馬",
  },
  {
    id: "2",
    name: "ストームエッジ",
    rating: 2.0,
    description: "安定した走りで上位を狙う",
  },
  {
    id: "3",
    name: "サンダーボルト",
    rating: 3.0,
    description: "末脚に期待の実力馬",
  },
  {
    id: "4",
    name: "ロイヤルクレスト",
    rating: 3.5,
    description: "格上の血統で堂々と先頭を狙う",
  },
  {
    id: "5",
    name: "花鳥風月",
    rating: 5.0,
    description: "波乱を呼ぶダークホース",
  },
  {
    id: "6",
    name: "ブレイズハート",
    rating: 6.0,
    description: "燃える闘志で最後まで食らいつく",
  },
  {
    id: "7",
    name: "スカイライン",
    rating: 8.0,
    description: "堅実な走りで連対圏内",
  },
  {
    id: "8",
    name: "シルバーウィンド",
    rating: 9.0,
    description: "風に乗る軽快な差し脚",
  },
  {
    id: "9",
    name: "ナイトメア",
    rating: 12.0,
    description: "一発の魅力を秘める",
  },
  {
    id: "10",
    name: "ヴァルキリー",
    rating: 14.0,
    description: "気性は荒いが、はまれば強い",
  },
  {
    id: "11",
    name: "ダイヤモンドダスト",
    rating: 18.0,
    description: "寒い馬場でこそ輝く隠れた実力馬",
  },
  {
    id: "12",
    name: "エクスプレス",
    rating: 22.0,
    description: "スピード自慢の逃げ馬",
  },
  {
    id: "13",
    name: "ミッドナイト",
    rating: 28.0,
    description: "夜の追い込みに期待がかかる",
  },
  {
    id: "14",
    name: "ゴッドスピード",
    rating: 65.0,
    description: "名前負けしないか、それが問題",
  },
  {
    id: "15",
    name: "ネオジェネシス",
    rating: 143.0,
    description: "新世代の怪物、のはず",
  },
  {
    id: "16",
    name: "漆黒",
    rating: 302.0,
    description: "大穴で一発を狙う",
  },
]);

// 互換用: 8頭モードの馬(テストなどで使う)
export const runners = runners8;
