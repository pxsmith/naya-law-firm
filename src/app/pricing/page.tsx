import type { Metadata } from "next";
import { SurveyExperience } from "@/components/survey/SurveyExperience";

export const metadata: Metadata = {
  title: "Get Pricing",
  description:
    "A two-minute survey on commercial real estate legal fees — built to shape fairer, more predictable pricing.",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return <SurveyExperience />;
}
