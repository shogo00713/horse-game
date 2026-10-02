import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RunnerRow from "./RunnerRow";
import type { Runner } from "../types/game";

const phoenix: Runner = { id: "phoenix", name: "フェニックス", odds: 1.2 };

describe("RunnerRow", () => {
  it("馬の名前とオッズを表示する", () => {
    render(
      <RunnerRow
        runner={phoenix}
        isSelected={false}
        disabled={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("フェニックス")).toBeInTheDocument();
    expect(screen.getByText("1.2倍")).toBeInTheDocument();
  });

  it("クリックすると onClick が呼ばれる", async () => {
    const onClick = vi.fn();
    render(
      <RunnerRow
        runner={phoenix}
        isSelected={false}
        disabled={false}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("selectionBadgeを渡すと表示される", () => {
    render(
      <RunnerRow
        runner={phoenix}
        isSelected={true}
        selectionBadge="1"
        disabled={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
