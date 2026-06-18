"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import styles from "./Faq.module.css";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

interface FaqProps {
  items: FaqItem[];
}

export function Faq({ items }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <dl className={styles.list}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const triggerId = `${baseId}-trigger-${index}`;
        return (
          <div
            key={index}
            className={open ? `${styles.item} ${styles.open}` : styles.item}
          >
            <dt className={styles.term}>
              <button
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span className={styles.question}>{item.question}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </dt>
            <dd
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={styles.panel}
            >
              <div className={styles.answerInner}>
                <div className={styles.answer}>{item.answer}</div>
              </div>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
