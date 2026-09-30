import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Node.js が実験的に持つ localStorage が壊れた状態(メソッド無し)で
// 先に定義されてしまうため、テスト用にちゃんと動くものを自前で用意して上書きする
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

globalThis.localStorage = new MemoryStorage();

afterEach(() => {
  cleanup();
  localStorage.clear();
});
