import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { AttorneyCard } from "@/components/AttorneyCard";
import { getAllAttorneys } from "@/lib/content";
import styles from "./attorneys.module.css";

export const metadata: Metadata = {
  title: "Attorneys",
  description: "Meet the attorneys of Naya Law Firm.",
};

export default async function AttorneysIndex() {
  const attorneys = await getAllAttorneys();
  return (
    <>
      <PageIntro
        eyebrow="Our team"
        title="Attorneys"
        description="Substantive depth across every practice we serve."
      />
      <Container>
        <div className={styles.grid}>
          {attorneys.map((a) => (
            <AttorneyCard key={a.slug} attorney={a} />
          ))}
        </div>
      </Container>
    </>
  );
}
