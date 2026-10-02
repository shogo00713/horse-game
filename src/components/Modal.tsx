/**
 * 画面の中央に出るダイアログの共通部品
 *
 * 背景のクリックか、Escキーで閉じる
 */

import { useEffect, type ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number; // ダイアログの最大幅(px)
};

export default function Modal({
  title,
  onClose,
  children,
  width = 640,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
