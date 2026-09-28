/**
 * 競馬ゲーム全体の進行を管理するカスタムフック
 *
 */

import { useState } from "react";
import { runners } from "../data/runners";
import type { BetType, Phase, Runner, RaceHistory } from "../types/game";
import { makeFinishOrder } from "../logic/race";
import { calculatePayout } from "../logic/payout";
import { maxSelectable, buildBetSelection } from "../logic/betRules";

export function useHorseGame() {
  const [money, setMoney] = useState(5000);
  const [betstr, setBet] = useState("300");
  const [phase, setPhase] = useState<Phase>("BETTING");
  const [payout, setPayout] = useState(0);
  const [selectedRunners, setSelectedRunners] = useState<Runner[]>([]); // 選択済みの馬の配列
  const [result, setResult] = useState<Runner[]>([]);
  const [previousResult, setPreviousResult] = useState<Runner[]>([]);
  const [betType, setBetType] = useState<BetType>("WIN");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleRunner(runner: Runner) {
    setSelectedRunners((prev) => {
      const exists = prev.some((r) => r.id === runner.id);

      // 選ばれていたら → 解除
      if (exists) {
        return prev.filter((r) => r.id !== runner.id);
      }

      // 1頭 → 押したやつをそのまま選択
      const max = maxSelectable(betType);

      if (max === 1) {
        return [runner];
      }

      // まだ選択できる数未満なら → 追加
      if (prev.length < maxSelectable(betType)) {
        return [...prev, runner];
      }

      // 選択できる数すでに選ばれていたら → 何もしない
      return prev;
    });
  }

  function changeBetType(nextBetType: BetType) {
    setBetType(nextBetType);
    setSelectedRunners([]);
  }

  // 初期値を localStorage から復元
  const [raceHistory, setRaceHistory] = useState<RaceHistory[]>(() => {
    try {
      const saved = localStorage.getItem("horse-race-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [raceNo, setRaceNo] = useState<number>(() => {
    const saved = localStorage.getItem("horse-race-no");
    return saved ? Number(saved) : 1;
  });

  function go() {
    // ----- 抽選前 -----
    if (phase !== "BETTING") return;

    // 入力のエラーチェック
    const bet = Number(betstr);
    setErrorMessage("");
    if (bet <= 0) {
      setErrorMessage("賭ける金額を入力してください。");
      return;
    }
    if (bet > money) {
      setErrorMessage("所持金が不足しています。");
      return;
    }
    if (selectedRunners.length !== maxSelectable(betType)) {
      setErrorMessage(`選択できる馬の数は ${maxSelectable(betType)} 頭です。`);
      return;
    }

    // ----- 抽選中 => 結果発表 -----
    setPhase("DRAWING");
    setMoney((prev) => prev - bet);

    setTimeout(() => {
      const finishOrder = makeFinishOrder(runners);
      const selection = buildBetSelection(betType, selectedRunners);
      const payout = calculatePayout(bet, selection, finishOrder);
      setPreviousResult(result);
      setPayout(payout);
      setResult(finishOrder);
      setPhase("PAYOUT");
    }, 1000);
  }

  function accept() {
    // 新しい履歴を作成
    const newHistory: RaceHistory = {
      raceNo,
      result, // 今のレース結果
    };

    // 直近8レース分だけ保持
    const updated = [newHistory, ...raceHistory].slice(0, 8);

    setRaceHistory(updated);
    setRaceNo((n) => n + 1);

    // localStorage に保存
    localStorage.setItem("horse-race-history", JSON.stringify(updated));
    localStorage.setItem("horse-race-no", String(raceNo + 1));

    // 既存のリセット処理...
    setMoney((prev) => prev + payout);
    setPhase("BETTING");
    setPayout(0);
  }

  function setTotalBet() {
    setBet(money.toString());
  }

  function resetMoney() {
    setMoney(5000);
  }

  return {
    // states
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
    // actions
    setBet,
    changeBetType,
    setSelectedRunners,
    toggleRunner,
    go,
    accept,
    setTotalBet,
    resetMoney,
  };
}
