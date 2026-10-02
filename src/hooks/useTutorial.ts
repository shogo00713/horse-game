/**
 * 初回説明(チュートリアル)の表示状態
 *
 * 初めてアクセスしたときだけ自動で開く。「見た」という印は localStorage に残す
 */

import { useState } from "react";

const STORAGE_KEY = "horse-tutorial-seen";

function hasSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useTutorial() {
  const [isOpen, setIsOpen] = useState(() => !hasSeen());

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // 保存できなくても、画面は閉じる
    }
  }

  return { isOpen, open, close };
}
