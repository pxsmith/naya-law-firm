import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { PracticeAreaCard } from "@/components/PracticeAreaCard";
import { getAllPracticeAreas } from "@/lib/content";
import styles from "./practice-areas.module.css";

export const metadata: Metadata = {
  title: "Practice Areas",
  description: "The practice areas served by Naya Law Firm.",
};

export default async function PracticeAreasIndex() {
  const areas = await getAllPracticeAreas();
  return (
    <>
      <PageIntro
        eyebrow="What we do"
        title="Practice areas"
        description="The firm represents clients across the following areas. Each practice is led by attorneys with substantive depth in their field."
      />
      <Container>
        <div className={styles.grid}>
          {areas.map((area) => (
            <PracticeAreaCard key={area.slug} area={area} />
          ))}
        </div>
      </Container>
    </>
  );
}
