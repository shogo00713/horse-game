import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHorseGame } from "./useHorseGame";
import type { Runner } from "../types/game";
import type { RaceHistory } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };
const storm: Runner = { id: "storm", name: "ストームエッジ", odds: 2.0 };
const thunder: Runner = { id: "thunder", name: "サンダーボルト", odds: 3.0 };

describe("useHorseGame", () => {
  describe("初期状態", () => {
    it("ベットが1件、空の状態で始まる", () => {
      const { result } = renderHook(() => useHorseGame());

      expect(result.current.bets).toHaveLength(1);
      expect(result.current.bets[0].betType).toBe("WIN");
      expect(result.current.bets[0].selectedRunners).toEqual([]);
    });
  });

  describe("toggleRunner", () => {
    it("選択済みの馬をクリック → 解除される", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([phoenix]);

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([]);
    });

    it("単勝・複勝で選択状態で他の馬をクリック → そっちが選択される", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
        result.current.toggleRunner(id, storm);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([storm]);
    });

    it("上限未満で別の馬をクリック → それも選択される", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.changeBetType(id, "QUINELLA");
      });

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([phoenix]);

      act(() => {
        result.current.toggleRunner(id, storm);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([
        phoenix,
        storm,
      ]);
    });

    it("上限まで選んだ状態で別の馬をクリック → 何も起きない", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.changeBetType(id, "QUINELLA");
      });
      act(() => {
        result.current.toggleRunner(id, phoenix);
        result.current.toggleRunner(id, storm);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([
        phoenix,
        storm,
      ]);

      act(() => {
        result.current.toggleRunner(id, thunder);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([
        phoenix,
        storm,
      ]);
    });
  });

  describe("changeBetType", () => {
    it("betTypeを変えると、選択中の馬がリセットされる", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });
      expect(result.current.bets[0].selectedRunners).toEqual([phoenix]);

      act(() => {
        result.current.changeBetType(id, "TRIO");
      });
      expect(result.current.bets[0].selectedRunners).toEqual([]);
      expect(result.current.bets[0].betType).toBe("TRIO");
    });
  });

  describe("addBet / removeBet", () => {
    it("addBetで1件追加される", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.addBet();
      });

      expect(result.current.bets).toHaveLength(2);
    });

    it("5件まで追加できて、それ以上は増えない", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addBet();
        }
      });

      expect(result.current.bets).toHaveLength(result.current.maxBets);
    });

    it("removeBetで指定したベットが消える", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.addBet();
      });
      const secondId = result.current.bets[1].id;

      act(() => {
        result.current.removeBet(secondId);
      });

      expect(result.current.bets).toHaveLength(1);
    });
  });

  describe("canSubmit(ベット全件のバリデーション)", () => {
    it("馬も金額も未入力の初期状態では、提出できない", () => {
      const { result } = renderHook(() => useHorseGame());
      expect(result.current.canSubmit).toBe(false);
    });

    it("馬を選び、金額も入っていれば提出できる", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });

      expect(result.current.canSubmit).toBe(true);
    });

    it("2件目が未入力のままだと、全体として提出できない", () => {
      const { result } = renderHook(() => useHorseGame());
      const firstId = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(firstId, phoenix);
        result.current.addBet();
      });

      // 2件目は馬を選んでいないので、全体として不成立
      expect(result.current.canSubmit).toBe(false);
    });

    it("1件ずつは所持金以内でも、合計が所持金を超えていれば提出できない", () => {
      const { result } = renderHook(() => useHorseGame());
      const firstId = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(firstId, phoenix);
        result.current.changeBetAmount(firstId, "3000");
        result.current.addBet();
      });
      const secondId = result.current.bets[1].id;

      act(() => {
        result.current.toggleRunner(secondId, storm);
        result.current.changeBetAmount(secondId, "3000");
      });

      // 初期所持金5000円に対して、3000+3000=6000円は超過
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe("ResqetMoney", () => {
    it("所持金が500円を超えている初期状態では、リセットできない", () => {
      const { result } = renderHook(() => useHorseGame());
      expect(result.current.canResetMoney).toBe(false);
    });

    it("リセットできない状態で呼んでも、確認ダイアログすら出ない", () => {
      const confirmSpy = vi.spyOn(window, "confirm");
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.resetMoney();
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(result.current.money).toBe(5000); // 変化していない
    });
  });

  describe("accept", () => {
    it("履歴が1件追加され、raceNoが増える", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.accept();
      });

      expect(result.current.raceHistory).toHaveLength(1);
      expect(result.current.raceHistory[0].raceNo).toBe(1);
    });

    it("9回acceptすると、履歴は8件までしか残らない(一番古いものが消える)", () => {
      const { result } = renderHook(() => useHorseGame());

      for (let i = 0; i < 9; i++) {
        act(() => {
          result.current.accept();
        });
      }

      expect(result.current.raceHistory).toHaveLength(8);

      const raceNos = result.current.raceHistory.map((h) => h.raceNo);
      expect(raceNos).not.toContain(1);
    });

    it("acceptすると、localStorageにも保存される", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.accept();
      });

      const saved = JSON.parse(localStorage.getItem("horse-race-history")!);
      expect(saved).toHaveLength(1);
    });

    it("acceptすると、ベットが1件の空の状態に戻る", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.addBet();
        result.current.addBet();
      });
      expect(result.current.bets).toHaveLength(3);

      act(() => {
        result.current.accept();
      });

      expect(result.current.bets).toHaveLength(1);
      expect(result.current.bets[0].selectedRunners).toEqual([]);
    });
  });

  describe("go", () => {
    it("ベットが1件も成立していないと、エラーメッセージが出る", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.go();
      });

      expect(result.current.errorMessage).toBe(
        "馬の選択か金額が未入力のベットがあります。",
      );
      expect(result.current.phase).toBe("BETTING");
    });

    it("賭ける金額が0以下なら、エラーメッセージが出る", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
        result.current.changeBetAmount(id, "0");
      });
      act(() => {
        result.current.go();
      });

      expect(result.current.errorMessage).toBe(
        "馬の選択か金額が未入力のベットがあります。",
      );
      expect(result.current.phase).toBe("BETTING");
    });

    it("合計金額が所持金より多いと、エラーメッセージが出る", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
        result.current.changeBetAmount(id, "6000"); // 初期所持金5000円より多い
      });
      act(() => {
        result.current.go();
      });

      expect(result.current.errorMessage).toBe("所持金が不足しています。");
      expect(result.current.phase).toBe("BETTING");
    });
  });

  describe("goのタイマー関連", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("有効な入力なら、抽選中→結果発表の順に進む", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });

      act(() => {
        result.current.go();
      });

      expect(result.current.phase).toBe("DRAWING");
      expect(result.current.money).toBe(5000 - 300); // デフォルトのbetstr="300"分減る

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.phase).toBe("PAYOUT");
      expect(result.current.result).toHaveLength(
        result.current.runners.length,
      );
      expect(result.current.betResults).toHaveLength(1);
    });

    it("複数件のベットが、それぞれ個別に払い戻し判定され、合計がpayoutになる", () => {
      const { result } = renderHook(() => useHorseGame());
      const firstId = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(firstId, phoenix);
        result.current.addBet();
      });
      const secondId = result.current.bets[1].id;

      act(() => {
        result.current.toggleRunner(secondId, storm);
      });

      act(() => {
        result.current.go();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.betResults).toHaveLength(2);
      const sum = result.current.betResults.reduce(
        (s, r) => s + r.payout,
        0,
      );
      expect(result.current.payout).toBe(sum);
    });

    it("抽選中にもう一度go()を呼んでも、何も起きない", () => {
      const { result } = renderHook(() => useHorseGame());
      const id = result.current.bets[0].id;

      act(() => {
        result.current.toggleRunner(id, phoenix);
      });
      act(() => {
        result.current.go();
      });
      expect(result.current.phase).toBe("DRAWING");

      const moneyBefore = result.current.money;
      act(() => {
        result.current.go();
      });

      expect(result.current.money).toBe(moneyBefore);
      expect(result.current.phase).toBe("DRAWING");
    });
  });

  describe("初期化時のlocalStorage復元", () => {
    it("保存されている履歴があれば、それを復元する", () => {
      const savedHistory: RaceHistory[] = [
        { raceNo: 3, result: [phoenix, storm] },
      ];
      localStorage.setItem("horse-race-history", JSON.stringify(savedHistory));

      const { result } = renderHook(() => useHorseGame());

      expect(result.current.raceHistory).toEqual(savedHistory);
    });

    it("保存データが壊れている(不正なJSON)場合、履歴は空配列になる", () => {
      localStorage.setItem("horse-race-history", "これは壊れたJSONです{{{");

      const { result } = renderHook(() => useHorseGame());

      expect(result.current.raceHistory).toEqual([]);
    });

    it("保存データが無ければ、履歴は空配列になる", () => {
      const { result } = renderHook(() => useHorseGame());

      expect(result.current.raceHistory).toEqual([]);
    });
  });
});
