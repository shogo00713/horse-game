import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DRAW_DURATION_MS } from "../logic/drawAnimation";
import ResultPanel from "./ResultPanel";
import type { Runner } from "../types/game";

// テスト用の馬データ
const runners: Runner[] = [
  { id: "phoenix", name: "フェニックス", odds: 1.2 },
  { id: "storm", name: "ストームエッジ", odds: 2.0 },
];

// テスト用の着順データ
const result: Runner[] = [
  { id: "phoenix", name: "フェニックス", odds: 1.2 },
  { id: "storm", name: "ストームエッジ", odds: 2.0 },
];
const previousResult: Runner[] = [
  { id: "storm", name: "ストームエッジ", odds: 2.0 },
  { id: "phoenix", name: "フェニックス", odds: 1.2 },
];

describe("ResultPanel", () => {
  it("BETTINGフェーズの場合、現在の着順は非表示、前回の着順は表示", () => {
    render(
      <ResultPanel
        phase="BETTING"
        runners={runners}
        result={result}
        previousResult={previousResult}
        betMarks={{}}
        onSkip={() => {}}
      />,
    );

    expect(screen.getByText("現在 : ベット受付中")).toBeInTheDocument();
    expect(screen.getByText("1位:")).toBeInTheDocument();
    expect(screen.getByText("2位:")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(runners.length);

    const previousLines = screen.getAllByTestId("finish-line");
    previousLines.forEach((line) => {
      expect(line).not.toHaveTextContent("フェニックス");
      expect(line).not.toHaveTextContent("ストームエッジ");
    });

    const previousResultLines = screen.getAllByTestId("previous-result-line");
    expect(previousResultLines[0]).toHaveTextContent("1位:");
    expect(previousResultLines[0]).toHaveTextContent("ストームエッジ");
    expect(previousResultLines[1]).toHaveTextContent("2位:");
    expect(previousResultLines[1]).toHaveTextContent("フェニックス");
  });

  describe("DRAWINGフェーズ(抽選演出)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function renderDrawing(onSkip = () => {}) {
      render(
        <ResultPanel
          phase="DRAWING"
          runners={runners}
          result={result}
          previousResult={previousResult}
          betMarks={{}}
          onSkip={onSkip}
        />,
      );
    }

    it("開始直後は着順は伏せられ、前回の着順も非表示", () => {
      renderDrawing();

      expect(screen.getByText("現在 : 抽選中")).toBeInTheDocument();

      // 順位枠の中は空(名前はプレート側に出る)
      screen.getAllByTestId("finish-line").forEach((line) => {
        expect(line).not.toHaveTextContent("フェニックス");
        expect(line).not.toHaveTextContent("ストームエッジ");
      });

      screen.getAllByTestId("previous-result-line").forEach((line) => {
        expect(line).not.toHaveTextContent("フェニックス");
        expect(line).not.toHaveTextContent("ストームエッジ");
      });
    });

    it("演出中は、名前入りのプレートが順位ごとに表示される", () => {
      renderDrawing();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const plates = screen.getAllByTestId("runner-plate");
      expect(plates).toHaveLength(runners.length);
      expect(plates.map((p) => p.dataset.rank).sort()).toEqual(["1", "2"]);
    });

    it("演出の終盤は、プレートが結果どおりの順位に収まる", () => {
      renderDrawing();

      act(() => {
        vi.advanceTimersByTime(DRAW_DURATION_MS - 100);
      });

      const byRank = Object.fromEntries(
        screen
          .getAllByTestId("runner-plate")
          .map((p) => [p.dataset.rank, p.textContent]),
      );
      expect(byRank["1"]).toContain("フェニックス");
      expect(byRank["2"]).toContain("ストームエッジ");
    });

    it("自分がBETした馬のプレートには、BETの番号の印が付く", () => {
      render(
        <ResultPanel
          phase="DRAWING"
          runners={runners}
          result={result}
          previousResult={previousResult}
          betMarks={{ storm: [1, 3] }}
          onSkip={() => {}}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const plates = screen.getAllByTestId("runner-plate");
      const marked = plates.filter((p) => p.textContent?.includes("BET"));
      expect(marked).toHaveLength(1);
      expect(marked[0]).toHaveTextContent("ストームエッジ");
      // 複数のベットで選んでいれば、番号がすべて付く
      expect(marked[0]).toHaveTextContent("BET1");
      expect(marked[0]).toHaveTextContent("BET3");
    });

    it("スキップボタンで onSkip が呼ばれる", async () => {
      vi.useRealTimers();
      const onSkip = vi.fn();
      renderDrawing(onSkip);

      await userEvent.click(
        screen.getByRole("button", { name: "結果へスキップ" }),
      );

      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  it("PAYOUTフェーズの場合、現在の着順は表示、前回の着順も表示", () => {
    render(
      <ResultPanel
        phase="PAYOUT"
        runners={runners}
        result={result}
        previousResult={previousResult}
        betMarks={{}}
        onSkip={() => {}}
      />,
    );

    const [firstLine, secondLine] = screen.getAllByTestId("finish-line");
    const [previousFirstLine, previousSecondLine] = screen.getAllByTestId(
      "previous-result-line",
    );

    expect(screen.getByText("現在 : 払い戻し中")).toBeInTheDocument();

    expect(firstLine).toHaveTextContent("1位:");
    expect(firstLine).toHaveTextContent("フェニックス");
    expect(secondLine).toHaveTextContent("2位:");
    expect(secondLine).toHaveTextContent("ストームエッジ");

    expect(previousFirstLine).toHaveTextContent("1位:");
    expect(previousFirstLine).toHaveTextContent("ストームエッジ");
    expect(previousSecondLine).toHaveTextContent("2位:");
    expect(previousSecondLine).toHaveTextContent("フェニックス");
  });
});
