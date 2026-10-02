import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PayoutPanel from "./PayoutPanel";
import type { BetResult, Runner } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };
const storm: Runner = { id: "storm", name: "ストームエッジ", odds: 2.0 };

function makeBetResult(overrides: Partial<BetResult> = {}): BetResult {
  return {
    bet: {
      id: "bet-1",
      betType: "WIN",
      selectedRunners: [phoenix],
      betstr: "300",
    },
    payout: 0,
    ...overrides,
  };
}

describe("PayoutPanel", () => {
  it("的中したベットは「的中」と払い戻し額を表示する", () => {
    // ベットが1件だけだと、個別の払い戻し額と合計が必ず同じ値になってしまうため、
    // 要素数で区別できるよう getAllByText を使う
    const betResults = [makeBetResult({ payout: 360 })];
    render(
      <PayoutPanel
        betResults={betResults}
        payout={360}
        maxBets={5}
        onAccept={() => {}}
      />,
    );

    expect(screen.getByText("的中")).toBeInTheDocument();
    expect(screen.getAllByText("¥360")).toHaveLength(2); // 個別の金額 + 合計
  });

  it("外れたベットは「はずれ」と表示する", () => {
    const betResults = [makeBetResult({ payout: 0 })];
    render(
      <PayoutPanel
        betResults={betResults}
        payout={0}
        maxBets={5}
        onAccept={() => {}}
      />,
    );

    expect(screen.getByText("はずれ")).toBeInTheDocument();
  });

  it("複数件のベットが、それぞれ個別に表示される", () => {
    const betResults = [
      makeBetResult({
        bet: {
          id: "bet-1",
          betType: "WIN",
          selectedRunners: [phoenix],
          betstr: "300",
        },
        payout: 200,
      }),
      makeBetResult({
        bet: {
          id: "bet-2",
          betType: "PLACE",
          selectedRunners: [storm],
          betstr: "500",
        },
        payout: 160,
      }),
    ];
    // 合計(360)が、個別の払い戻し額(200, 160)のどれとも重複しないようにしてある
    render(
      <PayoutPanel
        betResults={betResults}
        payout={360}
        maxBets={5}
        onAccept={() => {}}
      />,
    );

    expect(screen.getAllByText("的中")).toHaveLength(2);
    expect(screen.getByText("¥200")).toBeInTheDocument();
    expect(screen.getByText("¥160")).toBeInTheDocument();
    expect(screen.getByText("¥360")).toBeInTheDocument();
  });

  it("払い戻しが0円のときは、ボタンの文言が「次に進む」になる", () => {
    render(
      <PayoutPanel
        betResults={[]}
        payout={0}
        maxBets={5}
        onAccept={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "次に進む" }),
    ).toBeInTheDocument();
  });

  it("ボタンをクリックすると onAccept が呼ばれる", async () => {
    const onAccept = vi.fn();
    render(
      <PayoutPanel
        betResults={[makeBetResult({ payout: 1000 })]}
        payout={1000}
        maxBets={5}
        onAccept={onAccept}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "¥1000 受け取る" }),
    );
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it("ベット件数がmaxBetsに満たない分は、空の点線スロットで埋められる", () => {
    const betResults = [makeBetResult({ payout: 0 })];
    const { container } = render(
      <PayoutPanel
        betResults={betResults}
        payout={0}
        maxBets={5}
        onAccept={() => {}}
      />,
    );

    expect(container.querySelectorAll('[class*="emptySlot"]')).toHaveLength(4);
  });
});
