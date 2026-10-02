import styles from "./Header.module.css";

type HeaderProps = {
  money: number;
  onResetMoney: () => void;
  canResetMoney: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function Header({
  money,
  onResetMoney,
  canResetMoney,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h1 className={styles.headerTitle}>競馬ゲーム</h1>
        <button onClick={onResetMoney} disabled={!canResetMoney}>
          所持金リセット
        </button>
        <button onClick={onToggleTheme}>
          {theme === "light" ? "🌙 ダークモード" : "☀️ ライトモード"}
        </button>
        <h1 className={styles.headerSub}>
          所持金: <span className={styles.money}>{money}</span> 円
        </h1>
      </div>
    </header>
  );
}
