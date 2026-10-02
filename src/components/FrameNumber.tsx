/**
 * 枠番(1〜8)の色付きの番号
 *
 * 出走馬一覧と、馬を選ぶ画面で同じ見た目を使う
 */

import styles from "./FrameNumber.module.css";

type FrameNumberProps = {
  number: number; // 表示する番号(馬番)
  frame?: number; // 色を決める枠番(省略時は馬番と同じ)
  size?: "normal" | "small";
};

export default function FrameNumber({
  number,
  frame = number,
  size = "normal",
}: FrameNumberProps) {
  return (
    <span
      className={[
        styles.frame,
        styles[`frame${frame}`],
        size === "small" && styles.small,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {number}
    </span>
  );
}
