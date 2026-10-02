/**
 * メニュー
 *
 * 「せってい」と「あそびかた」のタブがある(開いたときは「せってい」から)。
 * せってい: ダークモードの切り替え、所持金リセット、初回説明をもう一度見る
 */

import { useState } from "react";
import Modal from "./Modal";
import GuideContent from "./GuideContent";
import Icon from "./Icon";
import { GAME_MODES, MODES, type GameMode } from "../data/modes";
import styles from "./MenuModal.module.css";

type Tab = "settings" | "guide";

type MenuModalProps = {
  onClose: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  canResetMoney: boolean;
  onResetMoney: () => void;
  onShowTutorial: () => void;
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  canChangeMode: boolean;
};

export default function MenuModal({
  onClose,
  theme,
  onToggleTheme,
  canResetMoney,
  onResetMoney,
  onShowTutorial,
  mode,
  onChangeMode,
  canChangeMode,
}: MenuModalProps) {
  const [tab, setTab] = useState<Tab>("settings");

  return (
    <Modal title="メニュー" onClose={onClose} width={680}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "settings"}
          className={tab === "settings" ? styles.tabActive : styles.tab}
          onClick={() => setTab("settings")}
        >
          せってい
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "guide"}
          className={tab === "guide" ? styles.tabActive : styles.tab}
          onClick={() => setTab("guide")}
        >
          あそびかた
        </button>
      </div>

      {tab === "guide" ? (
        <GuideContent />
      ) : (
        <ul className={styles.settings}>
          <li className={styles.setting}>
            <div className={styles.modeInfo}>
              <div className={styles.settingName}>モード(出走頭数)</div>
              <div className={styles.settingNote}>
                {MODES[mode].description}
                {!canChangeMode && "(ベット受付中のみ切り替えられます)"}
              </div>
              <div className={styles.modeButtons} role="radiogroup">
                {GAME_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={m === mode}
                    disabled={!canChangeMode}
                    className={
                      m === mode
                        ? `${styles.modeButton} ${styles.modeButtonActive}`
                        : styles.modeButton
                    }
                    onClick={() => onChangeMode(m)}
                  >
                    {MODES[m].label}
                  </button>
                ))}
              </div>
            </div>
          </li>

          <li className={styles.setting}>
            <div>
              <div className={styles.settingName}>
                {theme === "light" ? "ダークモード" : "ライトモード"}
              </div>
              <div className={styles.settingNote}>
                画面の明るさを切り替えます
              </div>
            </div>
            <button type="button" onClick={onToggleTheme}>
              <Icon name={theme === "light" ? "moon" : "sun"} /> 切り替える
            </button>
          </li>

          <li className={styles.setting}>
            <div>
              <div className={styles.settingName}>所持金リセット</div>
              <div className={styles.settingNote}>
                所持金が500円以下のときだけ、2000円に戻せます
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetMoney();
                onClose();
              }}
              disabled={!canResetMoney}
            >
              <Icon name="refresh" /> リセット
            </button>
          </li>

          <li className={styles.setting}>
            <div>
              <div className={styles.settingName}>初回の説明</div>
              <div className={styles.settingNote}>
                ゲームの流れの説明をもう一度見ます
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onShowTutorial();
              }}
            >
              <Icon name="play" /> 見る
            </button>
          </li>
        </ul>
      )}
    </Modal>
  );
}
