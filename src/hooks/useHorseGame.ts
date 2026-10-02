/**
 * 競馬ゲーム全体の進行を管理するカスタムフック
 *
 * go() で1回のレースが進行する(同時に複数件のベットを判定する)
 * accept() でレース結果を確定し、次のレースに進む
 */

import { useState } from "react";
import { runners } from "../data/runners";
import type {
  BetType,
  Phase,
  Runner,
  RaceHistory,
  Bet,
  BetResult,
} from "../types/game";
import { makeFinishOrder } from "../logic/race";
import { calculatePayout } from "../logic/payout";
import {
  maxSelectable,
  buildBetSelection,
  canResetMoney,
  isValidBet,
  totalBetAmount,
  canSubmitBets,
} from "../logic/betRules";

const MAX_BETS = 5;

// 空のベットを1件作る
function createEmptyBet(): Bet {
  return {
    id: crypto.randomUUID(),
    betType: "WIN",
    selectedRunners: [],
    betstr: "300",
  };
}

export function useHorseGame() {
  const [money, setMoney] = useState(5000);
  const [phase, setPhase] = useState<Phase>("BETTING");
  const [payout, setPayout] = useState(0);
  const [betResults, setBetResults] = useState<BetResult[]>([]);
  const [bets, setBets] = useState<Bet[]>(() => [createEmptyBet()]);
  const [result, setResult] = useState<Runner[]>([]);
  const [previousResult, setPreviousResult] = useState<Runner[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // ベットを1件追加する(最大5件まで)
  function addBet() {
    setBets((prev) =>
      prev.length < MAX_BETS ? [...prev, createEmptyBet()] : prev,
    );
  }

  // ベットを1件削除する
  function removeBet(id: string) {
    setBets((prev) => prev.filter((b) => b.id !== id));
  }

  // 指定したベットの賭け方を切り替える(選択中の馬はリセットする)
  function changeBetType(id: string, nextBetType: BetType) {
    setBets((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, betType: nextBetType, selectedRunners: [] }
          : b,
      ),
    );
  }

  // 指定したベットの賭け金額を変更する
  function changeBetAmount(id: string, value: string) {
    setBets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, betstr: value } : b)),
    );
  }

  // 指定したベットの、選択中の馬を切り替える
  function toggleRunner(id: string, runner: Runner) {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;

        const exists = b.selectedRunners.some((r) => r.id === runner.id);

        // 選ばれていたら → 解除
        if (exists) {
          return {
            ...b,
            selectedRunners: b.selectedRunners.filter(
              (r) => r.id !== runner.id,
            ),
          };
        }

        const max = maxSelectable(b.betType);

        // 1頭 → 押したやつをそのまま選択
        if (max === 1) {
          return { ...b, selectedRunners: [runner] };
        }

        // まだ選択できる数未満なら → 追加
        if (b.selectedRunners.length < max) {
          return { ...b, selectedRunners: [...b.selectedRunners, runner] };
        }

        // 選択できる数すでに選ばれていたら → 何もしない
        return b;
      }),
    );
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

  // 所持金をリセットする補助関数
  function resetMoney() {
    if (canResetMoney(phase, money)) {
      if (window.confirm("所持金を2000円にリセットします。よろしいですか？")) {
        setTimeout(() => {
          setMoney(2000);
        }, 2000);
      }
    }
  }

  function go() {
    // ----- 抽選前 -----

    if (phase !== "BETTING") return;

    // 入力のエラーチェック
    setErrorMessage("");
    if (bets.length === 0) {
      setErrorMessage("ベットを1件以上追加してください。");
      return;
    }
    if (!bets.every(isValidBet)) {
      setErrorMessage("馬の選択か金額が未入力のベットがあります。");
      return;
    }
    const total = totalBetAmount(bets);
    if (total > money) {
      setErrorMessage("所持金が不足しています。");
      return;
    }

    // ----- 抽選中 -----
    setPhase("DRAWING");
    setMoney((prev) => prev - total);

    setTimeout(() => {
      // 前回結果の保存
      setPreviousResult(result);
      // 着順の生成(全ベット共通、同じ1回のレース)
      const finishOrder = makeFinishOrder(runners);
      setResult(finishOrder);

      // ベットごとに払い戻しを計算する
      const results: BetResult[] = bets.map((bet) => {
        const selection = buildBetSelection(bet.betType, bet.selectedRunners);
        const betPayout = calculatePayout(
          Number(bet.betstr),
          selection,
          finishOrder,
        );
        return { bet, payout: betPayout };
      });
      setBetResults(results);
      setPayout(results.reduce((sum, r) => sum + r.payout, 0));
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
    setBetResults([]);
    setBets([createEmptyBet()]);
  }

  return {
    runners,
    money,
    phase,
    payout,
    bets,
    betResults,
    result,
    previousResult,
    errorMessage,
    raceHistory,
    canResetMoney: canResetMoney(phase, money),
    canSubmit: canSubmitBets(bets, money),
    totalBetAmount: totalBetAmount(bets),
    maxBets: MAX_BETS,
    addBet,
    removeBet,
    changeBetType,
    changeBetAmount,
    toggleRunner,
    go,
    accept,
    resetMoney,
  };
}
