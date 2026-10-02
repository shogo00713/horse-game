import { describe, it, expect } from "vitest";
import { marginalWinProbabilities, deriveOdds, RTP_BY_TYPE } from "./odds";
import { runners } from "../data/runners";
import { makeFinishOrder } from "./race";
import { dealConditions } from "./condition";

const strengths = runners.map((r) => r.strength!);

describe("marginalWinProbabilities", () => {
  it("全馬の合計は1", () => {
    const sum = marginalWinProbabilities(strengths).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });

  it("強い馬ほど勝率が高い", () => {
    const p = marginalWinProbabilities(strengths);
    expect(p[0]).toBeGreaterThan(p[3]);
    expect(p[3]).toBeGreaterThan(p[7]);
  });
});

describe("deriveOdds", () => {
  it("強い馬ほどオッズが低い", () => {
    const odds = deriveOdds(strengths, 0.8);
    expect(odds[0]).toBeLessThan(odds[3]);
    expect(odds[3]).toBeLessThan(odds[7]);
  });

  it("払い戻し率が高いほど、オッズも高い", () => {
    const low = deriveOdds(strengths, 0.7);
    const high = deriveOdds(strengths, 0.9);
    low.forEach((o, i) => expect(high[i]).toBeGreaterThanOrEqual(o));
  });
});

describe("馬データのオッズ", () => {
  it("調子が分からないとき、どの馬の単勝も期待値がほぼ同じ(単勝の払い戻し率)", () => {
    const p = marginalWinProbabilities(strengths);
    runners.forEach((r, i) => {
      // オッズは0.1刻みに丸めているので、少し誤差を許す
      expect(p[i] * r.odds).toBeGreaterThan(RTP_BY_TYPE.WIN - 0.05);
      expect(p[i] * r.odds).toBeLessThan(RTP_BY_TYPE.WIN + 0.05);
    });
  });

  it("実際にレースを回したときの1着率が、計算上の勝率に近い", () => {
    const p = marginalWinProbabilities(strengths);
    const trials = 20000;
    const wins = new Array(runners.length).fill(0);
    for (let i = 0; i < trials; i++) {
      const winner = makeFinishOrder(runners, dealConditions(runners))[0];
      wins[runners.findIndex((r) => r.id === winner.id)]++;
    }
    wins.forEach((w, i) => {
      expect(Math.abs(w / trials - p[i])).toBeLessThan(0.02);
    });
  });
});
