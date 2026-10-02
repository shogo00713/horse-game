/**
 * 枠番(色)の割り当て
 *
 * 枠は最大8つ(8色)。9頭以上のときは、後ろの枠から順に2頭ずつ入る
 * (中央競馬の決め方。16頭なら、すべての枠が2頭ずつ)
 */

const MAX_FRAMES = 8;

/**
 * 馬(0始まりの並び順)が入る枠番(1〜8)を返す
 *
 * @param index 馬の並び順(0始まり。表示する馬番は index + 1)
 * @param horseCount 出走頭数
 */
export function frameOf(index: number, horseCount: number): number {
  if (horseCount <= MAX_FRAMES) return index + 1;

  // 17頭以上は、全部の枠にできるだけ均等に入れる
  if (horseCount > MAX_FRAMES * 2) {
    return Math.floor((index * MAX_FRAMES) / horseCount) + 1;
  }

  const doubleFrames = horseCount - MAX_FRAMES; // 2頭入る枠の数
  const singleFrames = MAX_FRAMES - doubleFrames; // 1頭だけの枠の数

  if (index < singleFrames) return index + 1;
  return singleFrames + Math.floor((index - singleFrames) / 2) + 1;
}
