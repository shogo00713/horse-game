import styles from "./App.module.css";

import { useState } from "react";
import { useHorseGame } from "./hooks/useHorseGame";
import { useTheme } from "./hooks/useTheme";
import { useTutorial } from "./hooks/useTutorial";
import MenuModal from "./components/MenuModal";
import Tutorial from "./components/Tutorial";
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
    betResults,
    result,
    previousResult,
    conditions,
    errorMessage,
    raceHistory,
    canResetMoney,
    canSubmit,
    totalBetAmount,
    maxPayout,
    maxBets,
    addBet,
    removeBet,
    changeBetType,
    changeBetAmount,
    toggleRunner,
    go,
    skipDrawing,
    accept,
    resetMoney,
  } = useHorseGame();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tutorial = useTutorial();
  const { theme, toggleTheme } = useTheme();

  // 馬ごとに、その馬を選んでいるベットの番号(BET1, BET2…)をまとめる。着順側の印に使う
  const betMarks: Record<string, number[]> = {};
  bets.forEach((bet, index) => {
    bet.selectedRunners.forEach((r) => {
      (betMarks[r.id] ??= []).push(index + 1);
    });
  });

  return (
    <div className={styles.app}>
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={raceHistory}
        runners={runners}
      />

      {isMenuOpen && (
        <MenuModal
          onClose={() => setIsMenuOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
          canResetMoney={canResetMoney}
          onResetMoney={resetMoney}
          onShowTutorial={tutorial.open}
        />
      )}

      {tutorial.isOpen && <Tutorial onClose={tutorial.close} />}

      {/* ヘッダー部分 */}
      <Header
        money={money}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
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
            betMarks={betMarks}
            maxBets={maxBets}
            onSkip={skipDrawing}
          />
        </div>

        <div className={styles.rightPanel}>
          {errorMessage && (
            <p className={styles.errorMessage} aria-live="polite">
              {errorMessage}
            </p>
          )}

          {/* PAYOUTフェーズ中は、BETパネルの代わりに払い戻しパネルだけを表示する(同じサイズのカードとして差し替え) */}
          {phase === "PAYOUT" ? (
            <PayoutPanel
              betResults={betResults}
              payout={payout}
              maxBets={maxBets}
              onAccept={accept}
            />
          ) : (
            <BetPanel
              bets={bets}
              phase={phase}
              runners={runners}
              conditions={conditions}
              maxBets={maxBets}
              totalBetAmount={totalBetAmount}
              maxPayout={maxPayout}
              canSubmit={canSubmit}
              onAddBet={addBet}
              onRemoveBet={removeBet}
              onChangeBetType={changeBetType}
              onChangeBetAmount={changeBetAmount}
              onToggleRunner={toggleRunner}
              onSubmit={go}
            />
          )}
        </div>
      </main>
    </div>
  );
}
