import { describe, it, expect } from "vitest";
import { maxSelectable, isOrderedBetType, buildBetSelection, canResetMoney } from "./betRules";
import type { Runner } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };
const storm: Runner = { id: "storm", name: "ストームエッジ", odds: 2.0 };
const thunder: Runner = { id: "thunder", name: "サンダーボルト", odds: 3.0 };

  describe("canResetMoney", () => {
    it("BETTING中かつ500円以下ならtrue", () => {
      expect(canResetMoney("BETTING", 500)).toBe(true);
      expect(canResetMoney("BETTING", 0)).toBe(true);
    });
    it("500円を超えていればfalse", () => {
      expect(canResetMoney("BETTING", 501)).toBe(false);
    });
    it("BETTING中でなければfalse", () => {
      expect(canResetMoney("DRAWING", 100)).toBe(false);
    });
  });

describe("maxSelectable", () => {
  it("単勝・複勝は1頭", () => {
    expect(maxSelectable("WIN")).toBe(1);
    expect(maxSelectable("PLACE")).toBe(1);
  });
  it("馬連・馬単は2頭", () => {
    expect(maxSelectable("QUINELLA")).toBe(2);
    expect(maxSelectable("EXACTA")).toBe(2);
  });
  it("3連複・3連単は3頭", () => {
    expect(maxSelectable("TRIO")).toBe(3);
    expect(maxSelectable("TRIFECTA")).toBe(3);
  });
});

describe("isOrderedBetType", () => {
  it("3連単・馬単は着順を当てる必要がある", () => {
    expect(isOrderedBetType("TRIFECTA")).toBe(true);
    expect(isOrderedBetType("EXACTA")).toBe(true);
  });
  it("それ以外は組み合わせだけでよい", () => {
    expect(isOrderedBetType("WIN")).toBe(false);
    expect(isOrderedBetType("TRIO")).toBe(false);
    expect(isOrderedBetType("QUINELLA")).toBe(false);
  });
});

describe("buildBetSelection", () => {
  it("WIN: 1頭だけの runner を持つ形になる", () => {
    expect(buildBetSelection("WIN", [phoenix])).toEqual({
      betType: "WIN",
      runner: phoenix,
    });
  });
  it("EXACTA: 選んだ順番のまま runners に入る(着順を区別するため)", () => {
    expect(buildBetSelection("EXACTA", [storm, phoenix])).toEqual({
      betType: "EXACTA",
      runners: [storm, phoenix],
    });
  });
  it("TRIO: 3頭の runners を持つ形になる", () => {
    expect(buildBetSelection("TRIO", [phoenix, storm, thunder])).toEqual({
      betType: "TRIO",
      runners: [phoenix, storm, thunder],
    });
  });
});
