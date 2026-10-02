import styles from "./App.module.css";

import { useState } from "react";
import { useHorseGame } from "./hooks/useHorseGame";
import HistoryModal from "./components/HistoryModal";

import Header from "./components/Header";
import ResultPanel from "./components/ResultPanel";
import BetPanel from "./components/BetPanel";
import PayoutPanel from "./components/PayoutPanel";

export default function App() {
  const {
    runners,
    money,
    betstr,
    phase,
    payout,
    selectedRunners,
    result,
    previousResult,
    betType,
    errorMessage,
    raceHistory,
    canResetMoney,
    setBet,
    changeBetType,
    toggleRunner,
    go,
    accept,
    setTotalBet,
    resetMoney,
  } = useHorseGame();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className={styles.app}>
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={raceHistory}
      />

      {/* ヘッダー部分 */}
      <Header money={money} onResetMoney={resetMoney} canResetMoney={canResetMoney} />

      {/* メイン部分 */}
      <main className={styles.main}>
        <div className={styles.leftPanel}>
          {/* 結果表示パネル */}
          <ResultPanel
            phase={phase}
            runners={runners}
            result={result}
            previousResult={previousResult}
            selectedRunners={selectedRunners}
          />

          <button onClick={() => setIsHistoryOpen(true)}>
            {" "}
            📋 履歴
          </button>
        </div>

        <div className={styles.rightPanel}>
          {errorMessage && (
            <p className={styles.errorMessage} aria-live="polite">
              {errorMessage}
            </p>
          )}

          {/* ベットパネル */}
          <BetPanel
            betType={betType}
            phase={phase}
            betstr={betstr}
            runners={runners}
            selectedRunners={selectedRunners}
            onChangeBetType={changeBetType}
            onChangeBet={setBet}
            onSelectRunner={toggleRunner}
            onSetTotalBet={setTotalBet}
            onSubmit={go}
          />

          {/* 払い戻しパネル */}
          <PayoutPanel payout={payout} phase={phase} onAccept={accept} />
        </div>
      </main>
    </div>
  );
}
