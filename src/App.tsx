import "./App.css";

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
    selectedRunner,
    TrioSelectedRunner,
    TrifectaSelectedRunner,
    QuinellaSelectedRunner,
    ExactaSelectedRunner,
    result,
    previousResult,
    betType,
    errorMessage,
    raceHistory,
    setBet,
    setBetType,
    setSelectedRunner,
    toggleTrioSelectedRunner,
    toggleTrifectaSelectedRunner,
    toggleQuinellaSelectedRunner,
    toggleExactaSelectedRunner,
    go,
    accept,
    setTotalBet,
    resetMoney,
  } = useHorseGame();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="app">
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={raceHistory}
      />

      {/* ヘッダー部分 */}
      <Header money={money} onResetMoney={resetMoney} />

      {/* メイン部分 */}
      <main>
        <div className="left_panel">
          {/* 結果表示パネル */}
          <ResultPanel
            betType={betType}
            phase={phase}
            runners={runners}
            result={result}
            previousResult={previousResult}
            oneSelectedRunner={selectedRunner}
            trioSelectedRunner={TrioSelectedRunner}
            trifectaSelectedRunner={TrifectaSelectedRunner}
            quinellaSelectedRunner={QuinellaSelectedRunner}
            exactaSelectedRunner={ExactaSelectedRunner}
          />

          <button
            className="history_button"
            onClick={() => setIsHistoryOpen(true)}
          >
            {" "}
            📋 履歴
          </button>
        </div>

        <div className="right_panel">
          {errorMessage && (
            <p className="error_message" aria-live="polite">
              {errorMessage}
            </p>
          )}

          {/* ベットパネル */}
          <BetPanel
            betType={betType}
            phase={phase}
            betstr={betstr}
            oneSelectedRunner={selectedRunner}
            trioSelectedRunner={TrioSelectedRunner}
            trifectaSelectedRunner={TrifectaSelectedRunner}
            quinellaSelectedRunner={QuinellaSelectedRunner}
            exactaSelectedRunner={ExactaSelectedRunner}
            runners={runners}
            onChangeBetType={setBetType}
            onChangeBet={setBet}
            onSelectRunner={setSelectedRunner}
            toggleTrioSelectedRunner={toggleTrioSelectedRunner}
            toggleTrifectaSelectedRunner={toggleTrifectaSelectedRunner}
            toggleQuinellaSelectedRunner={toggleQuinellaSelectedRunner}
            toggleExactaSelectedRunner={toggleExactaSelectedRunner}
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
