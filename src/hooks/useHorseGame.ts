import { useState } from "react";
import { runners } from "../data/runners";
import type { BetType, Phase, Runner, RaceHistory } from "../types/game";
import type { Condition } from "../types/game";
import { makeFinishOrder } from "../logic/race";
import { calculatePayout } from "../logic/payout";


export function useHorseGame() {
  const [money, setMoney] = useState(5000);
  const [betstr, setBet] = useState("300");
  const [phase, setPhase] = useState<Phase>("BETTING");
  const [payout, setPayout] = useState(0);
  const [oneSelectedRunner, setSelectedRunner] = useState<Runner | null>(null); // 単勝・複勝 選択用
  const [TrioSelectedRunner, setTrioSelectedRunner] = useState<Runner[]>([]); // 3連複 選択用
  const [TrifectaSelectedRunner, setTrifectaSelectedRunner] = useState<Runner[]>([]); // 3連単 選択用
  const [QuinellaSelectedRunner, setQuinellaSelectedRunner] = useState<Runner[]>([]); // 馬連 選択用
  const [ExactaSelectedRunner, setExactaSelectedRunner] = useState<Runner[]>([]); // 馬単 選択用
  const [result, setResult] = useState<Runner[]>([]);
  const [previousResult, setPreviousResult] = useState<Runner[]>([]);
  const [betType, setBetType] = useState<BetType>("WIN");
  const [errorMessage, setErrorMessage] = useState("");
  const [conditionById, setConditionById] = useState<Record<string, Condition>>(() => initConditions());

  function toggleTrioSelectedRunner(runner: Runner) {
    setTrioSelectedRunner((prev) => {
      // すでに選ばれているか？
      const exists = prev.some((r) => r.id === runner.id);

      // 選ばれていたら → 解除
      if (exists) {
        return prev.filter((r) => r.id !== runner.id);
      }

      // まだ3頭未満なら → 追加
      if (prev.length < 3) {
        return [...prev, runner];
      }

      // 3頭すでに選ばれていたら → 何もしない
      return prev;
    });
  }

  function toggleTrifectaSelectedRunner(runner: Runner) {
    setTrifectaSelectedRunner((prev) => {
      // すでに選ばれているか？
      const exists = prev.some((r) => r.id === runner.id);

      // 選ばれていたら → 解除
      if (exists) {
        return prev.filter((r) => r.id !== runner.id);
      }

      // まだ3頭未満なら → 追加
      if (prev.length < 3) {
        return [...prev, runner];
      }

      // 3頭すでに選ばれていたら → 何もしない
      return prev;
    });
  }

  function toggleQuinellaSelectedRunner(runner: Runner) {
    setQuinellaSelectedRunner((prev) => {
      const exists = prev.some((r) => r.id === runner.id);
      if (exists) {
        return prev.filter((r) => r.id !== runner.id);
      }
      if (prev.length < 2) {
        return [...prev, runner];
      }
      return prev;
    });
  }

  function toggleExactaSelectedRunner(runner: Runner) {
    setExactaSelectedRunner((prev) => {
      const exists = prev.some((r) => r.id === runner.id);
      if (exists) {
        return prev.filter((r) => r.id !== runner.id);
      }
      if (prev.length < 2) {
        return [...prev, runner];
      }
      return prev;
    });
  }

  function initConditions(): Record<string, Condition> {
    const ids = [...runners.map((r) => r.id)];
    // シャッフル
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const map: Record<string, Condition> = {};
    runners.forEach((r) => (map[r.id] = "NORMAL"));
    ids.slice(0, 2).forEach((id) => (map[id] = "HOT"));
    ids.slice(2, 4).forEach((id) => (map[id] = "COLD"));
    return map;
  }

  function shuffleConditions() {
    setConditionById((prev) => {
      const next = { ...prev };
      const ids = runners.map((r) => r.id);
      const [a, b] = ids.sort(() => Math.random() - 0.5).slice(0, 2);
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
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
    if ((betType === "WIN" || betType === "PLACE") && oneSelectedRunner === null) {
      setErrorMessage("馬を選択してください。");
      return;
    }
    if (betType === "TRIO" && TrioSelectedRunner.length !== 3) {
      setErrorMessage("3匹の馬を選択してください。");
      return;
    }
    if (betType === "TRIFECTA" && TrifectaSelectedRunner.length !== 3) {
      setErrorMessage("3匹の馬を選択してください。");
      return;
    }
    if (betType === "QUINELLA" && QuinellaSelectedRunner.length !== 2) {
      setErrorMessage("2匹の馬を選択してください。");
      return;
    }
    if (betType === "EXACTA" && ExactaSelectedRunner.length !== 2) {
      setErrorMessage("2匹の馬を選択してください。");
      return;
    }

    // ----- 抽選中 => 結果発表 -----
    setPhase("DRAWING");
    setMoney((prev) => prev - bet);

    setTimeout(() => {
      const finishOrder = makeFinishOrder(runners, initConditions());
      const threeSelected = betType === "TRIO" ? TrioSelectedRunner : betType === "TRIFECTA" ? TrifectaSelectedRunner : [];
      const twoSelected = betType === "QUINELLA" ? QuinellaSelectedRunner : betType === "EXACTA" ? ExactaSelectedRunner : [];
      const payout = calculatePayout(bet, betType, oneSelectedRunner, threeSelected, twoSelected, finishOrder);
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
      result,           // 今のレース結果
      conditions: conditionById,  // 今の調子マップ
    };

    // 直近8レース分だけ保持
    const updated = [newHistory, ...raceHistory].slice(0, 8);

    setRaceHistory(updated);
    setRaceNo((n) => n + 1);

    // localStorage に保存
    localStorage.setItem("horse-race-history", JSON.stringify(updated));
    localStorage.setItem("horse-race-no", String(raceNo + 1));

    // 調子を入れ替え
    shuffleConditions();

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
    selectedRunner: oneSelectedRunner,
    TrioSelectedRunner: TrioSelectedRunner,
    TrifectaSelectedRunner: TrifectaSelectedRunner,
    QuinellaSelectedRunner: QuinellaSelectedRunner,
    ExactaSelectedRunner: ExactaSelectedRunner,
    result,
    previousResult,
    betType,
    errorMessage,
    conditionById,
    raceHistory,
    // actions
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
  };
}