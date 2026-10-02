import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuModal from "./MenuModal";

function renderMenu(overrides: Partial<Parameters<typeof MenuModal>[0]> = {}) {
  const props = {
    onClose: vi.fn(),
    theme: "light" as const,
    onToggleTheme: vi.fn(),
    canResetMoney: true,
    onResetMoney: vi.fn(),
    onShowTutorial: vi.fn(),
    ...overrides,
  };
  render(<MenuModal {...props} />);
  return props;
}

describe("MenuModal", () => {
  it("開いたときは「せってい」が先に表示される", () => {
    renderMenu();

    expect(screen.getByText("所持金リセット")).toBeInTheDocument();
    expect(screen.queryByText("券種のちがい")).toBeNull();
  });

  it("タブは「せってい」「あそびかた」の順に並ぶ", () => {
    renderMenu();

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveTextContent("せってい");
    expect(tabs[1]).toHaveTextContent("あそびかた");
  });

  it("「あそびかた」には券種の説明が載っている", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("tab", { name: "あそびかた" }));

    expect(screen.getByText("券種のちがい")).toBeInTheDocument();
    expect(screen.getByText("3連単")).toBeInTheDocument();
  });

  it("せっていタブでダークモードを切り替えられる", async () => {
    const props = renderMenu();

    await userEvent.click(screen.getByRole("tab", { name: "せってい" }));
    await userEvent.click(screen.getByRole("button", { name: /切り替える/ }));

    expect(props.onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("所持金リセットを押すと実行されてメニューが閉じる", async () => {
    const props = renderMenu();

    await userEvent.click(screen.getByRole("tab", { name: "せってい" }));
    await userEvent.click(screen.getByRole("button", { name: /リセット/ }));

    expect(props.onResetMoney).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("リセットできない状態では、リセットボタンが無効", async () => {
    renderMenu({ canResetMoney: false });

    await userEvent.click(screen.getByRole("tab", { name: "せってい" }));

    expect(screen.getByRole("button", { name: /リセット/ })).toBeDisabled();
  });

  it("初回の説明を見るを押すと、メニューを閉じて説明を開く", async () => {
    const props = renderMenu();

    await userEvent.click(screen.getByRole("tab", { name: "せってい" }));
    await userEvent.click(screen.getByRole("button", { name: /見る/ }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onShowTutorial).toHaveBeenCalledTimes(1);
  });
});
