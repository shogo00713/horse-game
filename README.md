# 🐎 Horse Game (競馬ゲーム)

React + TypeScript で実装した、競馬シミュレーションゲームです。  
プレイヤーは所持金を元に馬と賭け方を選び、レース結果に応じた配当を獲得します。

---

## 🚀 デモ

https://horse-game-xi.vercel.app/

---

## 🧠 概要

本ゲームでは以下の流れでレースを実行します。

1. ユーザーが馬・賭け金・賭け方を選択
2. オッズを重みとした確率抽選で着順を決定
3. 結果を所持金へ反映

---

## ⚙️ 技術スタック

- React (コンポーネント, Hooks)
- TypeScript
- 重み付き確率抽選アルゴリズム

---

## ディレクトリ構成

```txt
src/
  App.tsx            # 画面全体の組み立て
  types/
    game.ts          # Phase, BET, Runner 型定義
  data/
    runners.ts       # 出走馬の固定データ
  logic/
    race.ts          # 順位決定アルゴリズム
    payout.ts        # 配当計算ロジック
  hooks/
    useHorseGame.ts  # ゲームの状態とメインロジック
  components/
    Header.tsx
    ResultPanel.tsx
    BetPanel.tsx
    RunnerButton.tsx
    PayoutPanel.tsx
  App.css
```

---

## ロジック

#### 順位決定（`logic/race.ts`）

- 各馬のオッズから「重み」を計算し、`1 / odds` を重みとして確率的に順位を決定
- 先頭から順番に 1 着、2 着…を選んでいく方式でランダムな着順を生成

#### 配当計算（`logic/payout.ts`）

- 単勝: 選択した馬が 1 着の場合のみ、`bet * odds` を払い戻し
- 複勝: 選択した馬が 3 着以内なら、オッズを少しマイルドにした独自係数で払い戻し

---

## コンポーネント設計

- `Header`: タイトルと所持金表示、所持金リセットボタン
- `ResultPanel`: 現在のフェーズ、着順、前回結果の表示
- `BetPanel`: 賭け方選択、馬選択、ベット金額入力、全額ベットボタン、確定ボタン
- `RunnerButton`: 1 頭分の馬を表示するボタンコンポーネント
- `PayoutPanel`: 獲得金額の表示と「受け取り」ボタン

UI コンポーネントは基本的に「表示とユーザー操作のみ」を担当し、状態変更は親から渡された callback を呼ぶ構成にしています。

---

## 工夫した点

- ロジック（`logic/`）と UI（`components/`）、状態管理（`hooks/`）、データ（`data/`）を分離して、役割ごとにファイルを整理

---

## 今後の拡張アイデア

- レースアニメーションの追加
- レース履歴一覧・統計表示
- オッズの自動調整や難易度設定
- 馬の調子機能の実装
- 他の賭け方 (3連複など) の実装
- モバイル UI の調整
