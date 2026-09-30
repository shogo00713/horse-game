import { describe, it, expect } from "vitest";
import { calculatePayout } from "./payout";
import type { Runner } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };
const storm: Runner = { id: "storm", name: "ストームエッジ", odds: 2.0 };
const thunder: Runner = { id: "thunder", name: "サンダーボルト", odds: 3.0 };
const nova: Runner = { id: "nova", name: "花鳥風月", odds: 5.0 };

describe("calculatePayout - WIN", () => {
  it("選んだ馬が1着なら bet * odds を払い戻す", () => {
    const payout = calculatePayout(300, { betType: "WIN", runner: phoenix }, [
      phoenix,
      storm,
    ]);
    expect(payout).toBe(Math.floor(300 * phoenix.odds));
  });

  it("選んだ馬が1着でなければ0を返す", () => {
    const payout = calculatePayout(300, { betType: "WIN", runner: phoenix }, [
      storm,
      phoenix,
    ]);
    expect(payout).toBe(0);
  });
});

describe("calculatePayout - PLACE", () => {
  it("選んだ馬が3着以内(1着でなくても)なら払い戻す", () => {
    const payout = calculatePayout(
      300,
      { betType: "PLACE", runner: phoenix },
      [storm, thunder, phoenix], // phoenixは3着
    );
    const placeOdds = 1 + (phoenix.odds - 0.7) * 0.3553;
    expect(payout).toBe(Math.floor(placeOdds * 300));
  });

  it("選んだ馬が4着以下なら0を返す", () => {
    const payout = calculatePayout(
      300,
      { betType: "PLACE", runner: phoenix },
      [storm, thunder, nova, phoenix], // phoenixは4着
    );
    expect(payout).toBe(0);
  });
});

describe("calculatePayout - TRIO", () => {
  it("順番が違っても、同じ組み合わせなら当たる", () => {
    const selected: [Runner, Runner, Runner] = [thunder, phoenix, storm];
    const payout = calculatePayout(
      300,
      { betType: "TRIO", runners: selected },
      [phoenix, storm, thunder], // 実際の着順は選んだ順と違う
    );
    const trioOdds =
      15 +
      (selected[0].odds - 1) * 2.0 +
      (selected[1].odds - 1) * 1.5 +
      (selected[2].odds - 1) * 1.0;
    expect(payout).toBe(Math.floor(trioOdds * 300));
  });

  it("選んだ組み合わせが違えば0を返す", () => {
    const payout = calculatePayout(
      300,
      { betType: "TRIO", runners: [phoenix, storm, thunder] },
      [phoenix, storm, nova], // 3着がthunderではなくnova
    );
    expect(payout).toBe(0);
  });
});

describe("calculatePayout - TRIFECTA", () => {
  it("選んだ順番通りに着順が決まれば当たる", () => {
    const selected: [Runner, Runner, Runner] = [phoenix, storm, thunder];
    const payout = calculatePayout(
      300,
      { betType: "TRIFECTA", runners: selected },
      [phoenix, storm, thunder], // 選んだ順と一致
    );
    const trifectaOdds =
      40 +
      (selected[0].odds - 1) * 4.0 +
      (selected[1].odds - 1) * 2.5 +
      (selected[2].odds - 1) * 2.0;
    expect(payout).toBe(Math.floor(trifectaOdds * 300));
  });

  it("同じ3頭でも、着順が違えば0を返す", () => {
    const payout = calculatePayout(
      300,
      { betType: "TRIFECTA", runners: [phoenix, storm, thunder] },
      [storm, phoenix, thunder], // 同じ3頭だが1着と2着が逆
    );
    expect(payout).toBe(0);
  });
});

describe("calculatePayout - QUINELLA", () => {
  it("順番が違っても、同じ組み合わせなら当たる", () => {
    const selected: [Runner, Runner] = [storm, phoenix];
    const payout = calculatePayout(
      300,
      { betType: "QUINELLA", runners: selected },
      [phoenix, storm, thunder], // 実際は1着phoenix, 2着storm(選んだ順と逆)
    );
    const quinellaOdds =
      8 + (selected[0].odds - 1) * 1.5 + (selected[1].odds - 1) * 1.0;
    expect(payout).toBe(Math.floor(quinellaOdds * 300));
  });

  it("選んだ組み合わせが違えば0を返す", () => {
    const payout = calculatePayout(
      300,
      { betType: "QUINELLA", runners: [phoenix, storm] },
      [phoenix, thunder, storm], // 2着がstormではなくthunder
    );
    expect(payout).toBe(0);
  });
});

describe("calculatePayout - EXACTA", () => {
  it("選んだ順番通りに1着・2着が決まれば当たる", () => {
    const selected: [Runner, Runner] = [phoenix, storm];
    const payout = calculatePayout(
      300,
      { betType: "EXACTA", runners: selected },
      [phoenix, storm, thunder], // 選んだ順と一致
    );
    const exactaOdds =
      20 + (selected[0].odds - 1) * 3.0 + (selected[1].odds - 1) * 2.0;
    expect(payout).toBe(Math.floor(exactaOdds * 300));
  });

  it("同じ2頭でも、順番が逆なら0を返す", () => {
    const payout = calculatePayout(
      300,
      { betType: "EXACTA", runners: [phoenix, storm] },
      [storm, phoenix, thunder], // 同じ2頭だが順番が逆
    );
    expect(payout).toBe(0);
  });
});
