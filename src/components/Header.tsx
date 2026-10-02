import Icon from "./Icon";
import styles from "./Header.module.css";

type HeaderProps = {
  money: number;
  onOpenMenu: () => void;
  onOpenHistory: () => void;
};

export default function Header({
  money,
  onOpenMenu,
  onOpenHistory,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h1 className={styles.headerTitle}>競馬ゲーム</h1>

        <nav className={styles.actions} aria-label="ナビゲーション">
          <button type="button" className={styles.action} onClick={onOpenMenu}>
            <Icon name="menu" /> メニュー
          </button>
          <button
            type="button"
            className={styles.action}
            onClick={onOpenHistory}
          >
            <Icon name="history" /> 履歴
          </button>
        </nav>

        <h1 className={styles.headerSub}>
          所持金 : <span className={styles.money}>{money}</span> 円
        </h1>
      </div>
    </header>
  );
}
