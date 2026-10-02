/**
 * あそびかたの中身(メニューの「あそびかた」で表示する)
 */

import { GUIDE_STEPS, BET_TYPE_GUIDE } from "../data/guide";
import Icon from "./Icon";
import styles from "./GuideContent.module.css";

export default function GuideContent() {
  return (
    <div className={styles.guide}>
      {GUIDE_STEPS.map((step) => (
        <section key={step.title} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Icon name={step.icon} /> {step.title}
          </h3>
          {step.body.map((line) => (
            <p key={line} className={styles.line}>
              {line}
            </p>
          ))}
        </section>
      ))}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <Icon name="pencil" /> 券種のちがい
        </h3>
        <dl className={styles.types}>
          {BET_TYPE_GUIDE.map((t) => (
            <div key={t.name} className={styles.type}>
              <dt>{t.name}</dt>
              <dd>{t.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
