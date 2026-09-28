import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PayoutPanel from "./PayoutPanel";

describe("PayoutPanel", () => {
  it("PAYOUTフェーズの場合、受け取りボタンは有効化される", () => {
    render(<PayoutPanel phase="PAYOUT" payout={1000} onAccept={() => {}} />);

    expect(screen.getByRole("button", { name: "受け取り" })).toBeEnabled();
  });

  it("PAYOUTフェーズでない場合、受け取りボタンは無効化される", () => {
    render(<PayoutPanel phase="BETTING" payout={1000} onAccept={() => {}} />);

    expect(screen.getByRole("button", { name: "受け取り" })).toBeDisabled();
  });

  it("受け取りボタンをクリックすると onAccept が呼ばれる", async () => {
    const onAccept = vi.fn();
    render(<PayoutPanel phase="PAYOUT" payout={1000} onAccept={onAccept} />);

    await userEvent.click(screen.getByRole("button", { name: "受け取り" }));
    expect(onAccept).toHaveBeenCalledOnce();
  });
});
