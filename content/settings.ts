export const siteSettings = {
    firmName: "Naya Law",
  tagline:
    "An AI-native law firm for institutional lenders. Fixed-fee commercial real estate closings.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nayalawgroup.com",
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "",

  contact: {
    email: "info@nayalawgroup.com",
    // No public phone number yet — leave blank so the schema omits it rather
    // than advertising a placeholder.
    phone: "",
    phoneDisplay: "",
  },

  // Legal entity behind the firm (used for Organization structured data).
  legalEntity: "Naya Software, Inc.",

  offices: [
    {
      label: "Main Office",
      street: "802 E. Whiting Street",
      city: "Tampa",
      region: "FL",
      postalCode: "33602",
      country: "US",
      hours: "Mon–Fri, 9:00 AM – 5:30 PM",
    },
  ],

  social: {
    linkedin: "https://www.linkedin.com/company/naya-software/",
    x: "",
  },

  disclaimers: {
    attorneyAdvertising:
      "Attorney Advertising. The information provided on this website is for general informational purposes only and does not constitute legal advice. Prior results do not guarantee a similar outcome.",
    legalAdvice:
      "Visiting this website or contacting Naya Law does not create an attorney-client relationship. Please do not send confidential information until such a relationship has been established in writing.",
  },
} as const;

export type SiteSettings = typeof siteSettings;
