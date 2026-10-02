import { describe, it, expect } from "vitest";
import { frameOf } from "./frames";

describe("frameOf", () => {
  it("8頭以下なら、馬番と枠番は同じ", () => {
    for (let i = 0; i < 8; i++) expect(frameOf(i, 8)).toBe(i + 1);
    expect(frameOf(2, 5)).toBe(3);
  });

  it("16頭なら、すべての枠に2頭ずつ入る", () => {
    const frames = Array.from({ length: 16 }, (_, i) => frameOf(i, 16));
    expect(frames).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]);
  });

  it("9〜15頭なら、後ろの枠から2頭ずつ入る(12頭の例)", () => {
    const frames = Array.from({ length: 12 }, (_, i) => frameOf(i, 12));
    // 前の4枠は1頭ずつ、後ろの4枠は2頭ずつ
    expect(frames).toEqual([1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8]);
  });

  it("枠番は必ず1〜8に収まる", () => {
    for (let n = 1; n <= 18; n++) {
      for (let i = 0; i < n; i++) {
        const f = frameOf(i, n);
        expect(f).toBeGreaterThanOrEqual(1);
        expect(f).toBeLessThanOrEqual(8);
      }
    }
  });
});
