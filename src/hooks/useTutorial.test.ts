import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTutorial } from "./useTutorial";

describe("useTutorial", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("初めてのアクセスでは、最初から開いている", () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.isOpen).toBe(true);
  });

  it("閉じると、次回以降は自動で開かない", () => {
    const first = renderHook(() => useTutorial());
    act(() => {
      first.result.current.close();
    });
    expect(first.result.current.isOpen).toBe(false);

    const second = renderHook(() => useTutorial());
    expect(second.result.current.isOpen).toBe(false);
  });

  it("見たあとでも、openで手動で開き直せる", () => {
    const { result } = renderHook(() => useTutorial());
    act(() => {
      result.current.close();
    });

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });
});
