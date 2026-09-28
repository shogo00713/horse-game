import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BetPanel from "./BetPanel";
import type { Runner } from "../types/game";

// テスト用の馬データ
const runners: Runner[] = [
  { id: "phoenix", name: "フェニックス", odds: 1.2 },
  { id: "storm", name: "ストームエッジ", odds: 2.0 },
];

// 関数呼び出し確認用の共通のprops初期値
function renderBetPanel(
  overrides: Partial<ComponentProps<typeof BetPanel>> = {},
) {
  const props: ComponentProps<typeof BetPanel> = {
    betType: "WIN",
    phase: "BETTING",
    betstr: "300",
    runners,
    selectedRunners: [],
    onChangeBetType: () => {},
    onChangeBet: () => {},
    onSelectRunner: () => {},
    onSetTotalBet: () => {},
    onSubmit: () => {},
    ...overrides,
  };
  return render(<BetPanel {...props} />);
}

describe("BetPanel", () => {
  it("BETTINGフェーズかつ馬を最大数選んでいる場合、確定ボタンは有効化される", () => {
    renderBetPanel({ selectedRunners: [runners[0]] });

    expect(screen.getByRole("button", { name: "確定" })).toBeEnabled();
  });

  it("BETTTINGフェーズでない場合、確定ボタンは無効化される", () => {
    renderBetPanel({ phase: "DRAWING" });

    expect(screen.getByRole("button", { name: "確定" })).toBeDisabled();
  });

  it("馬を最大数選んでいない場合、確定ボタンは無効化される", () => {
    renderBetPanel({ selectedRunners: [] });

    expect(screen.getByRole("button", { name: "確定" })).toBeDisabled();
  });

  it("賭け方を変えると onChangeBetType が呼ばれる", async () => {
    const onChangeBetType = vi.fn();
    renderBetPanel({ onChangeBetType });

    await userEvent.selectOptions(screen.getByRole("combobox"), "TRIO");

    expect(onChangeBetType).toHaveBeenCalledWith("TRIO");
  });

  it("金額を入力すると onChangeBet が呼ばれる", async () => {
    const onChangeBet = vi.fn();
    renderBetPanel({ onChangeBet });

    await userEvent.type(screen.getByRole("textbox"), "5");

    expect(onChangeBet).toHaveBeenCalled();
  });

  it("馬をクリックすると onSelectRunner が呼ばれる", async () => {
    const onSelectRunner = vi.fn();
    renderBetPanel({ onSelectRunner });

    await userEvent.click(screen.getByRole("button", { name: /フェニックス/ }));

    expect(onSelectRunner).toHaveBeenCalledWith(runners[0]);
  });

  it("全額賭けるボタンで onSetTotalBet が呼ばれる", async () => {
    const onSetTotalBet = vi.fn();
    renderBetPanel({ onSetTotalBet });

    await userEvent.click(screen.getByRole("button", { name: "全額賭ける" }));

    expect(onSetTotalBet).toHaveBeenCalledOnce();
  });

  it("確定ボタンで onSubmit が呼ばれる", async () => {
    const onSubmit = vi.fn();
    // 単勝は1頭選んでいないとボタンが無効になるので、選択済み状態で描画する
    renderBetPanel({ selectedRunners: [runners[0]], onSubmit });

    await userEvent.click(screen.getByRole("button", { name: "確定" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
