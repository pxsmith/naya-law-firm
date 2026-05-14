import type { ReactNode } from "react";
import { Container } from "./Container";
import styles from "./PageIntro.module.css";

interface Props {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}

export function PageIntro({ eyebrow, title, description }: Props) {
  return (
    <section className={styles.intro}>
      <Container>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </Container>
    </section>
  );
}
