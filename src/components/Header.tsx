import styles from "./Header.module.css";

type HeaderProps = {
  money: number;
  onResetMoney: () => void;
  canResetMoney: boolean;
};

export default function Header({
  money,
  onResetMoney,
  canResetMoney,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h1 className={styles.headerTitle}>競馬ゲーム</h1>
        <button onClick={onResetMoney} disabled={!canResetMoney}>
          所持金リセット
        </button>
        <h1 className={styles.headerSub}>
          所持金: <span className={styles.money}>{money}</span> 円
        </h1>
      </div>
    </header>
  );
}
