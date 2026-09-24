/**
 * 賞金計算ロジック
 * 
 * 賞金の計算は、各ベットタイプに応じて異なるアルゴリズムを使用する、アルゴリズムは以下
 * - 単勝: 1着のオッズを基に計算
 * - 複勝: 1着から3着までのオッズを基に計算
 * - 3連複: 3頭のオッズを基に計算
 * - 3連単: 順序を考慮した3頭のオッズを基に計算
 * - 馬連: 2頭のオッズを基に計算
 * - 馬単: 順序を考慮した2頭のオッズを基に計算
 */

import { BetSelection, Runner } from "../types/game";

/**
 * 配当計算アルゴリズム本体
 * 
 * selection.betTypeに応じて、各ベットタイプの計算関数を呼び出す
 * 
 * @param bet 
 * @param selection
 * @param result 
 * @returns 
 */
export function calculatePayout(
    bet: number,
    selection: BetSelection,
    result: Runner[]): number {

    switch (selection.betType) {
        case "WIN":
            return calculateWinPayout(bet, selection.runner, result);
        case "PLACE":
            return calculatePlacePayout(bet, selection.runner, result);
        case "TRIO":
            return calculateTrioPayout(bet, selection.runners, result);
        case "TRIFECTA":
            return calculateTrifectaPayout(bet, selection.runners, result);
        case "QUINELLA":
            return calculateQuinellaPayout(bet, selection.runners, result);
        case "EXACTA":
            return calculateExactaPayout(bet, selection.runners, result);
    }
    
}

// 順序を考慮した一致判定
function isSameOrder(
    selected: Runner[],
    result: Runner[],
    count: number
): boolean {
    const selectedIds = selected.map((r) => r.id);
    const resultIds = result.slice(0, count).map((r) => r.id);
    return selectedIds.every((id, i) => id === resultIds[i]);
}

// 順序を考慮しない一致判定
function isSameCombination(
    selected: Runner[],
    result: Runner[],
    count: number
): boolean {

    if (selected.length !== count) return false;

    const selectedIds = selected.map((r) => r.id).sort();
    const resultIds = result.slice(0, count).map((r) => r.id).sort();
    return selectedIds.every((id, i) => id === resultIds[i]);
}


// 単勝計算
function calculateWinPayout(
    bet: number,
    selected: Runner,
    result: Runner[]
): number {

    // 単勝のオッズ計算式は、そのままのオッズを使用する

    const isHit = isSameOrder([selected], result, 1);
    return isHit ? Math.floor(selected.odds * bet) : 0;
    
}

// 複勝計算
function calculatePlacePayout(
    bet: number,
    selected: Runner,
    result: Runner[]
): number {

    // 複勝のオッズ計算式
    const placeOdds = 1 + (selected.odds - 0.7) * 0.3553; 

    const isHit = result.slice(0, 3).some(r => r.id === selected.id);
    return isHit ? Math.floor(placeOdds * bet) : 0;

}

// 3連復計算
function calculateTrioPayout(
    bet: number,
    threeSelected: [Runner, Runner, Runner],
    result: Runner[]
): number {

    // 3連複のオッズ計算式
    const trioOdds =
        15 +
        (threeSelected[0].odds - 1) * 2.0 +
        (threeSelected[1].odds - 1) * 1.5 +
        (threeSelected[2].odds - 1) * 1.0;

    const isHit = isSameCombination(threeSelected, result, 3);
    return isHit ? Math.floor(trioOdds * bet) : 0;
}

// 3連単計算
function calculateTrifectaPayout(
    bet: number,
    threeSelected: [Runner, Runner, Runner],
    result: Runner[]
): number {

    // 3連単のオッズ計算式
    const trifectaOdds =
        40 +
        (threeSelected[0].odds - 1) * 4.0 +
        (threeSelected[1].odds - 1) * 2.5 +
        (threeSelected[2].odds - 1) * 2.0;

    const isHit = isSameOrder(threeSelected, result, 3);
    return isHit ? Math.floor(trifectaOdds * bet) : 0;
}

// 馬連計算
function calculateQuinellaPayout(
    bet: number,
    twoSelected: [Runner, Runner],
    result: Runner[]
): number {

    // 馬連のオッズ計算式
    const quinellaOdds =
        8 +
        (twoSelected[0].odds - 1) * 1.5 +
        (twoSelected[1].odds - 1) * 1.0;
    
    const isHit = isSameCombination(twoSelected, result, 2);
    return isHit ? Math.floor(quinellaOdds * bet) : 0;
}

// 馬単計算
function calculateExactaPayout(
    bet: number,
    twoSelected: [Runner, Runner],
    result: Runner[]
): number {

    // 馬単のオッズ計算式
    const exactaOdds =
        20 +
        (twoSelected[0].odds - 1) * 3.0 +
        (twoSelected[1].odds - 1) * 2.0;

    const isHit = isSameOrder(twoSelected, result, 2);
    return isHit ? Math.floor(exactaOdds * bet) : 0;
}