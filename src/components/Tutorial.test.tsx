import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tutorial from "./Tutorial";
import { GUIDE_STEPS } from "../data/guide";

describe("Tutorial", () => {
  it("最初のステップが表示され、戻るボタンの代わりにスキップが出る", () => {
    render(<Tutorial onClose={() => {}} />);

    expect(screen.getByText(GUIDE_STEPS[0].title)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "スキップ" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "戻る" })).toBeNull();
  });

  it("次へ・戻るでステップを移動できる", async () => {
    render(<Tutorial onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByText(GUIDE_STEPS[1].title)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(screen.getByText(GUIDE_STEPS[0].title)).toBeInTheDocument();
  });

  it("最後のステップでは「はじめる」が出て、押すと閉じる", async () => {
    const onClose = vi.fn();
    render(<Tutorial onClose={onClose} />);

    for (let i = 0; i < GUIDE_STEPS.length - 1; i++) {
      await userEvent.click(screen.getByRole("button", { name: "次へ" }));
    }
    await userEvent.click(screen.getByRole("button", { name: "はじめる" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("スキップを押すと閉じる", async () => {
    const onClose = vi.fn();
    render(<Tutorial onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "スキップ" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escキーでも閉じる", async () => {
    const onClose = vi.fn();
    render(<Tutorial onClose={onClose} />);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
