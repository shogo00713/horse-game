import type { RaceHistory } from "../types/game";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  history: RaceHistory[];
};

export default function HistoryModal({ isOpen, onClose, history }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal_overlay" onClick={onClose}>
      <div className="modal_content" onClick={(e) => e.stopPropagation()}>
        <div className="modal_header">
          <h2>過去のレース結果 (7回前まで)</h2>
          <button className="modal_close" onClick={onClose}>
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <p className="modal_empty">まだレースがありません</p>
        ) : (
          history.map((h) => (
            <div key={h.raceNo} className="history_item">
              <h3 className="history_race_no">{history.indexOf(h) + 1} 回前</h3>
              <ol className="history_result">
                {h.result.map((r, i) => (
                  <li key={r.id} className="history_row">
                    <span className="history_rank">{i + 1}着</span>
                    <span className="history_name">{r.name}</span>
                    <span className="history_odds">odds {r.odds}</span>
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
