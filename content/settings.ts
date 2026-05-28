export const siteSettings = {
    firmName: "Naya Law",
  tagline:
    "An AI-native law firm for institutional lenders. Fixed-fee commercial real estate closings.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nayalawgroup.com",
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "",

  contact: {
    email: "info@nayalawgroup.com",
    phone: "+1 (555) 000-0000",
    phoneDisplay: "(555) 000-0000",
  },

  offices: [
    {
      label: "Main Office",
      street: "123 Example Avenue, Suite 100",
      city: "City",
      region: "ST",
      postalCode: "00000",
      country: "US",
      hours: "Mon–Fri, 9:00 AM – 5:30 PM",
    },
  ],

  social: {
    linkedin: "",
    x: "",
  },

  disclaimers: {
    attorneyAdvertising:
      "Attorney Advertising. The information provided on this website is for general informational purposes only and does not constitute legal advice. Prior results do not guarantee a similar outcome.",
    legalAdvice:
      "Visiting this website or contacting Naya Law Group does not create an attorney-client relationship. Please do not send confidential information until such a relationship has been established in writing.",
  },
} as const;

export type SiteSettings = typeof siteSettings;
