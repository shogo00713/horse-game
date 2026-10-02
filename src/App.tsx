import styles from "./App.module.css";

import { useState } from "react";
import { useHorseGame } from "./hooks/useHorseGame";
import { useTheme } from "./hooks/useTheme";
import HistoryModal from "./components/HistoryModal";

import Header from "./components/Header";
import ResultPanel from "./components/ResultPanel";
import BetPanel from "./components/BetPanel";
import PayoutPanel from "./components/PayoutPanel";

export default function App() {
  const {
    runners,
    money,
    phase,
    payout,
    bets,
    result,
    previousResult,
    errorMessage,
    raceHistory,
    canResetMoney,
    canSubmit,
    totalBetAmount,
    maxBets,
    addBet,
    removeBet,
    changeBetType,
    changeBetAmount,
    toggleRunner,
    go,
    accept,
    resetMoney,
  } = useHorseGame();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // 全ベットで選んでいる馬をまとめて、着順側のハイライトに使う
  const selectedRunners = bets.flatMap((bet) => bet.selectedRunners);

  return (
    <div className={styles.app}>
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={raceHistory}
      />

      {/* ヘッダー部分 */}
      <Header
        money={money}
        onResetMoney={resetMoney}
        canResetMoney={canResetMoney}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

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

          <button onClick={() => setIsHistoryOpen(true)}> 📋 履歴</button>
        </div>

        <div className={styles.rightPanel}>
          {errorMessage && (
            <p className={styles.errorMessage} aria-live="polite">
              {errorMessage}
            </p>
          )}

          {/* ベットパネル */}
          <BetPanel
            bets={bets}
            phase={phase}
            runners={runners}
            maxBets={maxBets}
            totalBetAmount={totalBetAmount}
            canSubmit={canSubmit}
            onAddBet={addBet}
            onRemoveBet={removeBet}
            onChangeBetType={changeBetType}
            onChangeBetAmount={changeBetAmount}
            onToggleRunner={toggleRunner}
            onSubmit={go}
          />

          {/* 払い戻しパネル */}
          <PayoutPanel payout={payout} phase={phase} onAccept={accept} />
        </div>
      </main>
    </div>
  );
}
