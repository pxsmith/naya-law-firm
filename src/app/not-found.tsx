import Link from "next/link";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";

export default function NotFound() {
  return (
    <>
      <PageIntro
        eyebrow="404"
        title="Page not found."
        description="The page you're looking for doesn't exist or has been moved."
      />
      <Container narrow>
        <p style={{ paddingBlock: "var(--space-12)" }}>
          Return to the <Link href="/">home page</Link> or get in touch with us
          via the <Link href="/contact">contact page</Link>.
        </p>
      </Container>
    </>
  );
}
