/**
 * 競馬ゲーム全体の進行を管理するカスタムフック
 *
 * go() で1回のレースが進行する
 * accept() でレース結果を確定し、次のレースに進む
 */

import { useState } from "react";
import { runners } from "../data/runners";
import type { BetType, Phase, Runner, RaceHistory } from "../types/game";
import { makeFinishOrder } from "../logic/race";
import { calculatePayout } from "../logic/payout";
import { maxSelectable, buildBetSelection, canResetMoney } from "../logic/betRules";

export function useHorseGame() {
  const [money, setMoney] = useState(5000);
  const [betstr, setBet] = useState("300");
  const [phase, setPhase] = useState<Phase>("BETTING");
  const [payout, setPayout] = useState(0);
  const [selectedRunners, setSelectedRunners] = useState<Runner[]>([]);
  const [result, setResult] = useState<Runner[]>([]);
  const [previousResult, setPreviousResult] = useState<Runner[]>([]);
  const [betType, setBetType] = useState<BetType>("WIN");
  const [errorMessage, setErrorMessage] = useState("");

  // 選択中の馬を切り替える操作のラッパー
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

  // ベットタイプを切り替える操作のラッパー
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

  // 全額ベット用の補助関数
  function setTotalBet() {
    setBet(money.toString());
  }

  // 所持金をリセットする補助関数
  function resetMoney() {
    if (canResetMoney(phase, money)) {
      if (window.confirm("所持金を2000円にリセットします。よろしいですか？")) {
        setTimeout(() => {
          setMoney(2000);
        }, 2000);
      }
    }
  };

  function go() {
    // ----- 抽選前 -----

    if (phase !== "BETTING") return;

    // 入力のエラーチェック
    const bet = Number(betstr);
    setErrorMessage("");
    if (bet <= 0) {
      setErrorMessage("賭ける金額を1円以上で入力してください。");
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

    // ----- 抽選中 -----
    setPhase("DRAWING");
    setMoney((prev) => prev - bet);

    setTimeout(() => {
      // 前回結果の保存
      setPreviousResult(result);
      // 選択の確定
      const selection = buildBetSelection(betType, selectedRunners);
      // 着順の生成
      const finishOrder = makeFinishOrder(runners);
      setResult(finishOrder);
      // 払い戻しの計算
      const payout = calculatePayout(bet, selection, finishOrder);
      setPayout(payout);
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

    // 次のレースの準備
    setMoney((prev) => prev + payout);
    setPhase("BETTING");
    setPayout(0);
  }

  return {
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
    canResetMoney : canResetMoney(phase, money),
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