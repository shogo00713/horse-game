# 🐎 Horse Game (競馬ゲーム)

![CI](https://github.com/shogo0713/horse-game/actions/workflows/ci.yml/badge.svg)

React + TypeScript で実装した、競馬シミュレーションゲームです。  
プレイヤーは所持金を元に馬と賭け方を選び、レース結果に応じた配当を獲得します。

---

## 🚀 デモ

https://horse-game-xi.vercel.app/

(現在一時停止中。近日中に再公開予定)

---

## 🧠 概要

本ゲームでは以下の流れでレースを実行します。

1. ユーザーが馬・賭け金・賭け方を選択
2. オッズを重みとした確率抽選で着順を決定
3. 結果を所持金へ反映

---

## ⚙️ 技術スタック

- 重み付き確率抽選アルゴリズム
- React 19 (コンポーネント, Hooks)
- TypeScript
- Vite (開発サーバー・ビルド)
- ESLint / Prettier (コード品質・整形)
- Vitest / Testing Library (テスト)
- GitHub Actions

---

## ディレクトリ構成

```txt
src/
  App.tsx              # 画面全体の組み立て
  types/
    game.ts            # Phase, BetType, Runner などの型定義
  data/
    runners.ts         # 出走馬の固定データ
  logic/
    race.ts            # 順位決定アルゴリズム
    payout.ts          # 配当計算ロジック
    betRules.ts        # 賭け方ごとの選択頭数・着順要否などのルール
  hooks/
    useHorseGame.ts    # ゲームの状態とメインロジック
  components/
    Header.tsx
    ResultPanel.tsx    # 結果表示画面
    BetPanel.tsx       # ベット画面
    RunnerButton.tsx   
    PayoutPanel.tsx    # 払い戻し表示画面
    HistoryModal.tsx   # 過去レース履歴画面
  App.css
```

主要なロジック・コンポーネントには、対応するテストファイル(`*.test.ts` / `*.test.tsx`)が併設されています。

---

## ロジック

#### 順位決定（`logic/race.ts`）

- 各馬のオッズから「重み」を計算し、`1 / odds` を重みとして確率的に順位を決定
- 先頭から順番に 1 着、2 着…を選んでいく方式でランダムな着順を生成

#### 配当計算（`logic/payout.ts`）

- 単勝: 選択した馬が 1 着の場合のみ、`bet * odds` を払い戻し
- 複勝: 選択した馬が 3 着以内なら、オッズを少しマイルドにした独自係数で払い戻し
- 3連複・3連単・馬連・馬単: 選択した馬たちのオッズから重み付きでオッズを計算し、組み合わせ一致（3連複・馬連）または着順一致（3連単・馬単）で判定

#### 賭け方のルール（`logic/betRules.ts`）

- 賭け方ごとに選択できる頭数（単勝・複勝は1頭、馬連・馬単は2頭、3連複・3連単は3頭）や、着順まで当てる必要があるかどうかを一元管理

---

## コンポーネント設計

- `Header`: タイトルと所持金表示、所持金リセットボタン
- `ResultPanel`: 現在のフェーズ、着順、前回結果の表示
- `BetPanel`: 賭け方選択、馬選択、ベット金額入力、全額ベットボタン、確定ボタン
- `RunnerButton`: 1 頭分の馬を表示するボタンコンポーネント
- `PayoutPanel`: 獲得金額の表示と「受け取り」ボタン
- `HistoryModal`: 過去レース履歴（直近8戦分）の表示

UI コンポーネントは基本的に「表示とユーザー操作のみ」を担当し、状態変更は親から渡された callback を呼ぶ構成にしています。

---

## 工夫した点

- ロジック（`logic/`）と UI（`components/`）、状態管理（`hooks/`）、データ（`data/`）を分離して、役割ごとにファイルを整理
- 賭け方ごとに分裂しがちだった選択状態・バリデーションを、共通ロジック（`betRules.ts`）に集約
- ロジック層・コンポーネント層・カスタムフックにテストを整備し、GitHub Actions で push のたびに自動検証

---

## 今後の拡張アイデア

- CSS の作り込み・レスポンシブ対応（スマホ操作の最適化）
- 馬の調子（隠しパラメータ）を実装
- 獲得した資金の使い道（課金要素）の追加
- レース履歴一覧・統計表示の拡充
- レースアニメーションの追加
