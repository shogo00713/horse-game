import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BetPanel from "./BetPanel";
import type { Runner, Bet } from "../types/game";

// テスト用の馬データ
const runners: Runner[] = [
  { id: "phoenix", name: "フェニックス", odds: 1.2 },
  { id: "storm", name: "ストームエッジ", odds: 2.0 },
];

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: "bet-1",
    betType: "WIN",
    selectedRunners: [],
    betstr: "300",
    ...overrides,
  };
}

// 共通のprops初期値 + 上書き用ヘルパー
function renderBetPanel(
  overrides: Partial<ComponentProps<typeof BetPanel>> = {},
) {
  const props: ComponentProps<typeof BetPanel> = {
    bets: [makeBet()],
    phase: "BETTING",
    runners,
    maxBets: 5,
    totalBetAmount: 300,
    canSubmit: false,
    onAddBet: () => {},
    onRemoveBet: () => {},
    onChangeBetType: () => {},
    onChangeBetAmount: () => {},
    onToggleRunner: () => {},
    onSubmit: () => {},
    ...overrides,
  };
  return render(<BetPanel {...props} />);
}

describe("BetPanel", () => {
  it("BETTING中かつcanSubmitならBETするボタンは有効化される", () => {
    renderBetPanel({ canSubmit: true });

    expect(screen.getByRole("button", { name: "BETする" })).toBeEnabled();
  });

  it("BETTING中でなければBETするボタンは無効化される", () => {
    renderBetPanel({ canSubmit: true, phase: "DRAWING" });

    expect(screen.getByRole("button", { name: "BETする" })).toBeDisabled();
  });

  it("canSubmitがfalseならBETするボタンは無効化される", () => {
    renderBetPanel({ canSubmit: false });

    expect(screen.getByRole("button", { name: "BETする" })).toBeDisabled();
  });

  it("賭け方を変えると onChangeBetType がベットIDと一緒に呼ばれる", async () => {
    const onChangeBetType = vi.fn();
    renderBetPanel({ bets: [makeBet({ id: "bet-1" })], onChangeBetType });

    await userEvent.selectOptions(screen.getByRole("combobox"), "TRIO");

    expect(onChangeBetType).toHaveBeenCalledWith("bet-1", "TRIO");
  });

  it("金額を入力すると onChangeBetAmount がベットIDと一緒に呼ばれる", async () => {
    const onChangeBetAmount = vi.fn();
    renderBetPanel({ bets: [makeBet({ id: "bet-1" })], onChangeBetAmount });

    await userEvent.type(screen.getByRole("textbox"), "5");

    expect(onChangeBetAmount).toHaveBeenCalled();
    expect(onChangeBetAmount.mock.calls[0][0]).toBe("bet-1");
  });

  it("馬をクリックすると onToggleRunner がベットIDと一緒に呼ばれる", async () => {
    const onToggleRunner = vi.fn();
    renderBetPanel({ bets: [makeBet({ id: "bet-1" })], onToggleRunner });

    await userEvent.click(screen.getByRole("button", { name: /フェニックス/ }));

    expect(onToggleRunner).toHaveBeenCalledWith("bet-1", runners[0]);
  });

  it("BETするボタンで onSubmit が呼ばれる", async () => {
    const onSubmit = vi.fn();
    renderBetPanel({ canSubmit: true, onSubmit });

    await userEvent.click(screen.getByRole("button", { name: "BETする" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("「＋ ベットを追加」で onAddBet が呼ばれる", async () => {
    const onAddBet = vi.fn();
    renderBetPanel({ onAddBet });

    await userEvent.click(
      screen.getByRole("button", { name: /ベットを追加/ }),
    );

    expect(onAddBet).toHaveBeenCalledOnce();
  });

  it("ベットが最大件数に達していると「＋ ベットを追加」は無効化される", () => {
    const fiveBets = Array.from({ length: 5 }, (_, i) =>
      makeBet({ id: `bet-${i}` }),
    );
    renderBetPanel({ bets: fiveBets, maxBets: 5 });

    expect(
      screen.getByRole("button", { name: /ベットを追加/ }),
    ).toBeDisabled();
  });

  it("ベットが1件だけのときは削除ボタンが表示されない", () => {
    renderBetPanel({ bets: [makeBet({ id: "bet-1" })] });

    expect(
      screen.queryByRole("button", { name: /削除/ }),
    ).not.toBeInTheDocument();
  });

  it("ベットが2件以上のとき、削除ボタンで onRemoveBet がベットIDと一緒に呼ばれる", async () => {
    const onRemoveBet = vi.fn();
    renderBetPanel({
      bets: [makeBet({ id: "bet-1" }), makeBet({ id: "bet-2" })],
      onRemoveBet,
    });

    const removeButtons = screen.getAllByRole("button", { name: /削除/ });
    await userEvent.click(removeButtons[0]);

    expect(onRemoveBet).toHaveBeenCalledWith("bet-1");
  });
});
