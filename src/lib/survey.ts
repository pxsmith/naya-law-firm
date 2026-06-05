/**
 * Survey definition — "Commercial Real Estate · Fixed Legal Fee Survey".
 *
 * This mirrors the live Google Form exactly so the custom experience can post
 * responses straight back to it (which means they keep landing in the same
 * Google Sheet the form is already wired to).
 *
 * The `entryId` and `options` strings MUST match the Google Form verbatim, or
 * Google will silently drop the answer. They were extracted from the form's
 * own data; if the form's questions change, re-pull these.
 */

export type SurveyQuestionType = "single" | "multi" | "text" | "longtext";

export interface SurveyQuestion {
  /** Stable internal key used in component state + the API payload. */
  id: string;
  /** Google Form field id, e.g. "entry.1962709598". */
  entryId: string;
  type: SurveyQuestionType;
  title: string;
  /** Optional helper line shown under the title. */
  description?: string;
  required: boolean;
  /** Present for "single" / "multi". */
  options?: string[];
  /** Placeholder for "text" / "longtext". */
  placeholder?: string;
}

export const SURVEY_META = {
  eyebrow: "Commercial Real Estate",
  title: "Fixed Legal Fee Survey",
  subtitle:
    "A few quick questions on how legal fees work on your loans. Anonymous, about two minutes — your answers help shape fairer, more predictable pricing.",
  /** Shown on the closing screen. */
  thanks: {
    title: "Thank you.",
    body: "Your response has been recorded. We genuinely appreciate the insight — it helps us build pricing that works for lenders like you.",
  },
} as const;

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "role",
    entryId: "entry.1962709598",
    type: "single",
    required: true,
    title: "What is your role?",
    options: ["In-House Counsel", "Originator", "Underwriting", "Mortgage Broker"],
  },
  {
    id: "loanSize",
    entryId: "entry.690996450",
    type: "multi",
    required: true,
    title: "What size mortgage loans do you make?",
    description: "Select all that apply.",
    options: [
      "Under $10MM",
      "$10MM - $25MM",
      "$25MM - $50MM",
      "$50MM - $100MM",
      "Over $100MM",
    ],
  },
  {
    id: "typicalFees",
    entryId: "entry.1295057542",
    type: "single",
    required: true,
    title: "What are the typical legal fees on your loans?",
    options: [
      "Under $10,000",
      "$10,000 - $25,000",
      "$25,000 - $50,000",
      "$50,000 - $100,000",
      "$100,000 - $200,000",
      "Over $200,000",
    ],
  },
  {
    id: "counselFixedFee",
    entryId: "entry.119450180",
    type: "single",
    required: true,
    title: "Do any of your outside counsel offer fixed legal fee pricing?",
    options: ["Yes", "No"],
  },
  {
    id: "borrowersPreferFixed",
    entryId: "entry.1236537789",
    type: "single",
    required: true,
    title:
      "Do you think your borrowers would prefer fixed fee pricing instead of hourly based pricing?",
    options: ["Yes", "No"],
  },
  {
    id: "valueBasedType",
    entryId: "entry.873142555",
    type: "multi",
    required: true,
    title: "What type of value based legal fee would be appealing to you?",
    description: "Select all that apply.",
    options: [
      "Fixed Based on Loan Amount",
      "Percentage of Loan Amount",
      "Ranges Based on Deal Size / Complexity",
      "Fixed with Add-Ons (Ground Lease / NY CEMA / TIC / Cash Management)",
    ],
  },
  {
    id: "counselSharedAi",
    entryId: "entry.1259551272",
    type: "single",
    required: true,
    title:
      "Has outside counsel shared with you how they are using AI / tech to work more efficiently?",
    options: ["Yes", "No"],
  },
  {
    id: "counselSharedSavings",
    entryId: "entry.121715712",
    type: "single",
    required: true,
    title:
      "Has outside counsel shared any of their time savings from AI / tech in the form of consistent or lower legal fees?",
    options: [
      "Yes, fees are more consistent and/or lower",
      "No, fees are the same or higher",
    ],
  },
  {
    id: "borrowerComplains",
    entryId: "entry.164059396",
    type: "single",
    required: false,
    title:
      "How often does the Borrower complain about legal fees being too high when they hit the settlement statement?",
    options: [
      "Almost all the time, it is a common problem",
      "About half the time",
      "Less than 20% of the time",
      "Almost never, no surprises with legal fees on our deals",
    ],
  },
  {
    id: "anonymousMessage",
    entryId: "entry.2026261484",
    type: "longtext",
    required: false,
    title:
      "Anything you'd like to anonymously share with outside counsel about pricing that would help win deals?",
    description: "Optional.",
    placeholder: "Type your message…",
  },
  {
    id: "name",
    entryId: "entry.872158116",
    type: "text",
    required: true,
    title: "Your name",
    placeholder: "Jane Doe",
  },
  {
    id: "email",
    // The Google Form has no email field. Until one is added, this is folded
    // into the Name field on submit (see the API route) so it isn't lost. Add
    // an "Email" question to the form, then drop its entry id here for a column.
    entryId: "",
    type: "text",
    required: true,
    title: "Your email",
    placeholder: "you@company.com",
  },
  {
    id: "lenderName",
    entryId: "entry.291486402",
    type: "text",
    required: false,
    title: "Lender name",
    description: "Optional.",
    placeholder: "Acme Capital",
  },
];
