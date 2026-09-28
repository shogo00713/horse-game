import { describe, it, expect } from "vitest";
import { calculatePayout } from "./payout";
import type { Runner } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };
const storm: Runner = { id: "storm", name: "ストームエッジ", odds: 2.0 };

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
