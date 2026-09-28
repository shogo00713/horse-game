import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RunnerButton from "./RunnerButton";
import type { Runner } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };

describe("RunnerButton", () => {
  it("馬の名前とオッズを表示する", () => {
    render(
      <RunnerButton
        runner={phoenix}
        isSelected={false}
        disabled={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("フェニックス")).toBeInTheDocument();
    expect(screen.getByText("Odds 1.2")).toBeInTheDocument();
  });

  it("クリックすると onClick が呼ばれる", async () => {
    const onClick = vi.fn();
    render(
      <RunnerButton
        runner={phoenix}
        isSelected={false}
        disabled={false}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
