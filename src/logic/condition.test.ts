import { describe, it, expect } from "vitest";
import {
  conditionDeck,
  NORMAL_CONDITION,
  dealConditions,
  isValidConditions,
  applyCondition,
  type Condition,
} from "./condition";
import { makeFinishOrder } from "./race";
import { runners } from "../data/runners";

describe("dealConditions", () => {
  const counts = (c: Record<string, Condition>) => {
    const result = [0, 0, 0, 0, 0];
    Object.values(c).forEach((level) => result[level]++);
    return result;
  };

  it("毎回、絶不調1・不調1・普通3・好調2・絶好調1で配られる", () => {
    for (let i = 0; i < 50; i++) {
      expect(counts(dealConditions(runners))).toEqual([1, 1, 3, 2, 1]);
    }
  });

  it("全馬ぶんの調子が正しい形で作られる", () => {
    expect(isValidConditions(dealConditions(runners), runners)).toBe(true);
  });

  it("乱数によって、配られ方が変わる", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      seen.add(JSON.stringify(dealConditions(runners)));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("ゆらぎが0なら、前の調子がそのまま引き継がれる", () => {
    const previous = dealConditions(runners);
    expect(dealConditions(runners, previous, () => 0.5)).toEqual(previous);
  });

  it("前を引き継いでも、内訳は毎回同じ", () => {
    let current = dealConditions(runners);
    for (let i = 0; i < 50; i++) {
      current = dealConditions(runners, current);
      expect(counts(current)).toEqual([1, 1, 3, 2, 1]);
    }
  });

  it("前の調子が良かった馬は、ランダムより良い調子を引きやすい", () => {
    const trials = 2000;
    let carried = 0;
    let fresh = 0;
    for (let i = 0; i < trials; i++) {
      const previous = dealConditions(runners);
      const best = runners.find((r) => previous[r.id] === 4)!;
      carried += dealConditions(runners, previous)[best.id];
      fresh += dealConditions(runners)[best.id];
    }
    expect(carried / trials).toBeGreaterThan(fresh / trials + 0.3);
  });

  it("馬が内訳より多い場合、余った1頭ぶんは普通が増える", () => {
    const many = [...runners, { id: "extra", name: "追加", odds: 5 }];
    expect(counts(dealConditions(many))).toEqual([1, 1, 4, 2, 1]);
  });
});

describe("isValidConditions", () => {
  it("不正な形・範囲外・馬が足りないものは弾く", () => {
    expect(isValidConditions(null, runners)).toBe(false);
    expect(isValidConditions({}, runners)).toBe(false);
    const bad = { ...dealConditions(runners), "1": 9 };
    expect(isValidConditions(bad, runners)).toBe(false);
  });
});

describe("applyCondition", () => {
  const avg = 0.27;

  it("普通なら重みは変わらない", () => {
    expect(applyCondition(0.5, NORMAL_CONDITION, avg)).toBe(0.5);
  });

  it("好調側は足し算なので、重みの小さい馬ほど倍率として大きく効く", () => {
    const small = applyCondition(0.04, 4, avg) / 0.04;
    const large = applyCondition(0.83, 4, avg) / 0.83;
    expect(small).toBeGreaterThan(large);
  });

  it("不調側でも重みは正のまま", () => {
    expect(applyCondition(0.001, 0, avg)).toBeGreaterThan(0);
  });
});

describe("調子が着順に与える影響(統計)", () => {
  function winRate(id: string, level: Condition, trials: number) {
    const conditions = Object.fromEntries(
      runners.map((r) => [r.id, r.id === id ? level : NORMAL_CONDITION]),
    );
    let wins = 0;
    for (let i = 0; i < trials; i++) {
      if (makeFinishOrder(runners, conditions)[0].id === id) wins++;
    }
    return wins / trials;
  }

  it("穴馬は絶好調だと勝率が大きく上がり、絶不調だと下がる", () => {
    const longshot = "8"; // 25倍
    const good = winRate(longshot, 4, 20000);
    const normal = winRate(longshot, 2, 20000);
    const bad = winRate(longshot, 0, 20000);
    expect(good).toBeGreaterThan(normal * 1.5);
    expect(bad).toBeLessThan(normal);
  });
});

describe("conditionDeck", () => {
  const count = (deck: Condition[]) => {
    const result = [0, 0, 0, 0, 0];
    deck.forEach((level) => result[level]++);
    return result;
  };

  it("8頭なら 絶不調1・不調1・普通3・好調2・絶好調1", () => {
    expect(count(conditionDeck(8))).toEqual([1, 1, 3, 2, 1]);
  });

  it("16頭なら 絶不調2・不調2・普通6・好調4・絶好調2", () => {
    expect(count(conditionDeck(16))).toEqual([2, 2, 6, 4, 2]);
  });

  it("頭数と同じ枚数で、良い順に並んでいる", () => {
    for (const n of [5, 8, 12, 16]) {
      const deck = conditionDeck(n);
      expect(deck).toHaveLength(n);
      expect(deck).toEqual([...deck].sort((a, b) => b - a));
    }
  });
});

describe("dealConditions - 16頭", () => {
  it("16頭の内訳で配られ、前を引き継いでも内訳は変わらない", () => {
    const horses = Array.from({ length: 16 }, (_, i) => ({
      id: String(i + 1),
      name: `馬${i + 1}`,
      odds: 5,
    }));
    let current = dealConditions(horses);
    for (let i = 0; i < 20; i++) {
      current = dealConditions(horses, current);
      const counts = [0, 0, 0, 0, 0];
      Object.values(current).forEach((c) => counts[c]++);
      expect(counts).toEqual([2, 2, 6, 4, 2]);
    }
  });
});
