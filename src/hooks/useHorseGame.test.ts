import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHorseGame } from "./useHorseGame";
import type { Runner } from "../types/game";
import type { RaceHistory } from "../types/game";


const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };
const storm: Runner = { id: "storm", name: "ストームエッジ", odds: 2.0 };
const thunder: Runner = { id: "thunder", name: "サンダーボルト", odds: 3.0 };

describe("useHorseGame", () => {
  describe("toggleRunner", () => {
    it("選択済みの馬をクリック → 解除される", () => {
      const { result } = renderHook(() => useHorseGame());

      // 1回目のクリックで選択される
      act(() => {
        result.current.toggleRunner(phoenix);
      });
      expect(result.current.selectedRunners).toEqual([phoenix]);

      // 同じ馬をもう一度クリックすると解除される
      act(() => {
        result.current.toggleRunner(phoenix);
      });
      expect(result.current.selectedRunners).toEqual([]);
    });

    it("単勝・複勝で選択状態で他の馬をクリック → そっちが選択される", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        // 1回目のクリックで選択される
        result.current.toggleRunner(phoenix);
        // 別の馬をもう一度クリックするとそちらが選択される
        result.current.toggleRunner(storm);
      });
      expect(result.current.selectedRunners).toEqual([storm]);
    });

    it("上限未満で別の馬をクリック → それも選択される", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.changeBetType("QUINELLA");
      });

      act(() => {
        result.current.toggleRunner(phoenix);
      });
      expect(result.current.selectedRunners).toEqual([phoenix]);

      act(() => {
        result.current.toggleRunner(storm);
      });
      expect(result.current.selectedRunners).toEqual([phoenix, storm]);
    });

    it("上限まで選んだ状態で別の馬をクリック → 何も起きない", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.changeBetType("QUINELLA");
      });
      act(() => {
        result.current.toggleRunner(phoenix);
        result.current.toggleRunner(storm);
      });
      expect(result.current.selectedRunners).toEqual([phoenix, storm]);

      // 上限に達した状態で3頭目をクリックしても変化しない
      act(() => {
        result.current.toggleRunner(thunder);
      });
      expect(result.current.selectedRunners).toEqual([phoenix, storm]);
    });
  });

  describe("changeBetType", () => {
    it("betTypeを変えると、選択中の馬がリセットされる", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.toggleRunner(phoenix);
      });
      expect(result.current.selectedRunners).toEqual([phoenix]);

      act(() => {
        result.current.changeBetType("TRIO");
      });
      expect(result.current.selectedRunners).toEqual([]);
      expect(result.current.betType).toBe("TRIO");
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

    // accept() を9回繰り返す
    for (let i = 0; i < 9; i++) {
      act(() => {
        result.current.accept();
      });
    }

    expect(result.current.raceHistory).toHaveLength(8);

    // 1回目(raceNo: 1)が一番古いので、もう含まれていないはず
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
  });

  describe("go", () => {
    it("賭ける金額が0以下なら、エラーメッセージが出る", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.setBet("0");
      });
      act(() => {
        result.current.go();
      });


      expect(result.current.errorMessage).toBe("賭ける金額を1円以上で入力してください。");
        expect(result.current.phase).toBe("BETTING");
      });

    it("所持金より多く賭けようとすると、エラーメッセージが出る", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.setBet("6000"); // 初期所持金5000円より多い
      });
      act(() => {
        result.current.go();
      });

      expect(result.current.errorMessage).toBe("所持金が不足しています。");
      expect(result.current.phase).toBe("BETTING");
    });

    it("選んだ頭数が賭け方と合っていないと、エラーメッセージが出る", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.go();
      });

      expect(result.current.errorMessage).toBe("選択できる馬の数は 1 頭です。");
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

      // 単勝1頭選んでおく
      act(() => {
        result.current.toggleRunner(phoenix);
      });

      act(() => {
        result.current.go();
      });

      expect(result.current.phase).toBe("DRAWING");
      expect(result.current.money).toBe(5000 - 300); // デフォルトのbetstr="300"分減る

      // 1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.phase).toBe("PAYOUT");
      expect(result.current.result).toHaveLength(result.current.runners.length);
    });

    it("抽選中にもう一度go()を呼んでも、何も起きない", () => {
      const { result } = renderHook(() => useHorseGame());

      act(() => {
        result.current.toggleRunner(phoenix);
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
      // 何もセットしない(localStorageは空のまま)
      const { result } = renderHook(() => useHorseGame());

      expect(result.current.raceHistory).toEqual([]);
    });
  });


});
