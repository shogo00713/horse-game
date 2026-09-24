/**
 * 馬のデータ
 * 
 * 配列にそのまま書き込んであり、基本的に変更しない
 */

import type { Runner } from "../types/game";

export const runners: Runner[] = [
  { id: "1", name: "フェニックス", odds: 1.2 },
  { id: "2", name: "ストームエッジ", odds: 2.0 },
  { id: "3", name: "サンダーボルト", odds: 3.0 },
  { id: "4", name: "花鳥風月", odds: 5.0 },
  { id: "5", name: "ナイトメア", odds: 10.0 },
  { id: "6", name: "スカイライン", odds: 10.0 },
  { id: "7", name: "エクスプレス", odds: 20.0 },
  { id: "8", name: "漆黒", odds: 25.0 },
];