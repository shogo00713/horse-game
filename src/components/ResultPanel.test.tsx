import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
    const { container } = render(
      <ResultPanel
        phase="BETTING"
        runners={runners}
        result={result}
        previousResult={previousResult}
        selectedRunners={[]}
      />,
    );

    expect(screen.getByText("現在 : ベット受付中!!")).toBeInTheDocument();
    expect(screen.getByText("1位:")).toBeInTheDocument();
    expect(screen.getByText("2位:")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(runners.length);

    const previousLines = container.querySelectorAll(".finishLine");
    previousLines.forEach((line) => {
      expect(line).not.toHaveTextContent("フェニックス");
      expect(line).not.toHaveTextContent("ストームエッジ");
    });

    const previousResultLines = container.querySelectorAll(
      ".previous_result_line",
    );
    expect(previousResultLines[0]).toHaveTextContent("1位:");
    expect(previousResultLines[0]).toHaveTextContent("ストームエッジ");
    expect(previousResultLines[1]).toHaveTextContent("2位:");
    expect(previousResultLines[1]).toHaveTextContent("フェニックス");
  });

  it("DRAWINGフェーズの場合、現在の着順は非表示、前回の着順も非表示", () => {
    const { container } = render(
      <ResultPanel
        phase="DRAWING"
        runners={runners}
        result={result}
        previousResult={previousResult}
        selectedRunners={[]}
      />,
    );

    expect(screen.getByText("現在 : 抽選中…")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(runners.length);

    // previous_result_lines側も、名前が出ていないことを直接確認する
    const previousLines = container.querySelectorAll(".previous_result_line");
    previousLines.forEach((line) => {
      expect(line).not.toHaveTextContent("フェニックス");
      expect(line).not.toHaveTextContent("ストームエッジ");
    });
  });

  it("PAYOUTフェーズの場合、現在の着順は表示、前回の着順も表示", () => {
    const { container } = render(
      <ResultPanel
        phase="PAYOUT"
        runners={runners}
        result={result}
        previousResult={previousResult}
        selectedRunners={[]}
      />,
    );

    const firstLine = container.querySelectorAll(".finishLine")[0];
    const secondLine = container.querySelectorAll(".finishLine")[1];

    const previousFirstLine = container.querySelectorAll(
      ".previous_result_line",
    )[0];
    const previousSecondLine = container.querySelectorAll(
      ".previous_result_line",
    )[1];

    expect(screen.getByText("現在 : 結果発表！")).toBeInTheDocument();

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
