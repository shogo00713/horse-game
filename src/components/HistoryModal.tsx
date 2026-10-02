import type { RaceHistory } from "../types/game";
import styles from "./HistoryModal.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  history: RaceHistory[];
};

export default function HistoryModal({ isOpen, onClose, history }: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>過去のレース結果 (7回前まで)</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <p className={styles.modalEmpty}>まだレースがありません</p>
        ) : (
          history.map((h) => (
            <div key={h.raceNo} className={styles.historyItem}>
              <h3 className={styles.historyRaceNo}>
                {history.indexOf(h) + 1} 回前
              </h3>
              <ol className={styles.historyResult}>
                {h.result.map((r, i) => (
                  <li key={r.id} className={styles.historyRow}>
                    <span className={styles.historyRank}>{i + 1}着</span>
                    <span className={styles.historyName}>{r.name}</span>
                    <span className={styles.historyOdds}>odds {r.odds}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
