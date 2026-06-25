import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "About",
  description:
    "Naya Law is an AI-native law firm for institutional lenders, focused on commercial real estate closings.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="A technology company first, now a new model law firm that is changing the business of law."
        description="Big Law judgment, fixed-fee economics, and a proprietary platform built specifically for commercial mortgage transactions and the AI era."
      />
      <Container narrow>
        <article
          className="prose"
          style={{
            paddingBlock: "var(--space-16)",
            display: "grid",
            gap: "var(--space-6)",
            maxWidth: "65ch",
          }}
        >
          <h2>The firm</h2>
          <p>
            Naya Law is a tech and AI-native law firm focused narrowly on
            commercial real estate and corporate lending transactions. We
            combine Big Law experience with a proprietary closing platform and
            fixed-fee pricing so institutional lenders can quote legal costs
            up front, close more loans with the same team, and stop paying for
            inefficiency.
          </p>

          <h2>The founders</h2>
          <p>
            Our team has spent decades practicing commercial real estate law at AM Law firms before building Naya Law. That background gives the firm
            experience with complex transactions; the delivery model is what
            differs.
          </p>

          <h2>What's different</h2>
          <p>
            Traditional law firms run on the billable hour — which means delay,
            manual work, and extra timekeepers all turn into a bigger invoice.
            The model also gives firms weak incentives to automate, because
            efficiency reduces billable time.
          </p>
          <p>
            Naya Law inverts that. The firm operates on its own software platform,
            customized for commercial mortgage closings, with document
            automation and workflow tooling built custom for each lender’s requirements. The
            legal workflow, software workflow, and client experience are
            designed together from day one.
          </p>
          <p>
            Because Naya does not bill by the hour, the incentive is simple:
            close the deal accurately, efficiently, and without unnecessary
            friction.
          </p>

          <h2>Track record</h2>
          <p>
            100+ commercial real estate loans with over $775MM in deal value closed using this model in the last two years.
          </p>

          <p style={{ marginTop: "var(--space-8)" }}>
            <Link href="/pricing">Get Pricing &rarr;</Link>
          </p>
        </article>
      </Container>
    </>
  );
}
