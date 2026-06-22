/**
 * Naya Law — Fixed-fee pricing.
 *
 * The single source of truth for every dollar figure in the price estimator,
 * transcribed from the firm's "Naya Fee Schedule / Fixed Fee Chart (2026)".
 *
 * A `null` price means "TBD": the deal can't be auto-quoted (e.g. loans over
 * $20MM, or extra negotiation), so the reveal routes the visitor to a quick
 * call instead of showing a misleading number.
 */

export interface LoanBand {
  /** Stable key stored as the answer + used as the line-item key. */
  key: string;
  label: string;
  /** Base fixed fee in whole dollars; null = TBD. */
  baseFee: number | null;
}

export interface AddonDef {
  key: string;
  label: string;
  /** Plain-language helper shown under the option label. */
  help?: string;
  /** Unit price in whole dollars; null = TBD (priced per transaction). */
  unitPrice: number | null;
  /** Billed per unit → show a quantity stepper. */
  hasQuantity?: boolean;
  minQty?: number;
  maxQty?: number;
  /** Suffix beside the price, e.g. "per lease", "each". */
  unitNote?: string;
}

export const LOAN_BANDS: LoanBand[] = [
  { key: "under2", label: "Under $2MM", baseFee: 10750 },
  { key: "b2to35", label: "$2MM – $3.499MM", baseFee: 12750 },
  { key: "b35to5", label: "$3.5MM – $5MM", baseFee: 14250 },
  { key: "b5to10", label: "$5MM – $10MM", baseFee: 16750 },
  { key: "b10to20", label: "$10MM – $20MM", baseFee: 19750 },
  { key: "over20", label: "Over $20MM", baseFee: null },
];

export const ADDONS: AddonDef[] = [
  {
    key: "nyCema",
    label: "New York / CEMA",
    help: "A New York structure (Consolidation, Extension & Modification) that lowers mortgage recording tax. New York deals only.",
    unitPrice: 3950,
  },
  {
    key: "masterLease",
    label: "Master Lease",
    help: "A single lease sitting above the building's individual leases.",
    unitPrice: 1950,
  },
  {
    key: "tic",
    label: "Tenancy-in-Common (TIC)",
    help: "Property owned by multiple parties as tenants-in-common. Covers up to 4 owners.",
    unitPrice: 3450,
  },
  {
    key: "leaseReview",
    label: "Lease Review / SNDA / Estoppel",
    help: "Per tenant: review the lease, prepare an SNDA, and obtain an estoppel.",
    unitPrice: 1950,
    hasQuantity: true,
    minQty: 1,
    unitNote: "per lease",
  },
  {
    key: "pledgeEquity",
    label: "Pledge of Equity",
    help: "Ownership interests in the borrower pledged as collateral.",
    unitPrice: 1450,
    hasQuantity: true,
    minQty: 1,
    unitNote: "per pledge",
  },
  {
    key: "estoppelsOnly",
    label: "Estoppels Only",
    help: "A tenant-signed confirmation of lease status, on its own.",
    unitPrice: 100,
    hasQuantity: true,
    minQty: 1,
    unitNote: "each",
  },
  {
    key: "condo",
    label: "Condo",
    help: "Condominium collateral — declaration / by-laws review plus condo title work.",
    unitPrice: 3450,
  },
  {
    key: "reaEstoppel",
    label: "REA Estoppel / Complicated Title",
    help: "Shared driveways, parking, or common areas, or unusually complex title.",
    unitPrice: 2950,
  },
  {
    key: "nonConsol",
    label: "Non-Consolidation Opinion Review",
    help: "Common on larger / CMBS loans; keeps borrower assets separate in bankruptcy.",
    unitPrice: 2000,
  },
  {
    key: "deSpe",
    label: "Delaware SPE / DE Opinions",
    help: "A Delaware bankruptcy-remote borrower entity plus Delaware legal opinions.",
    unitPrice: 2000,
  },
  {
    key: "extraNeg",
    label: "Extra Negotiation",
    help: "Heavily negotiated deals are quoted separately — flags a custom estimate.",
    unitPrice: null,
  },
];

export interface QuoteLineItem {
  key: string;
  label: string;
  unitPrice: number | null;
  quantity: number;
  /** unitPrice × quantity, or null when the item is TBD. */
  amount: number | null;
  hasQuantity: boolean;
  unitNote?: string;
  isTBD: boolean;
}

export interface Quote {
  baseKey: string | null;
  baseLabel: string | null;
  baseFee: number | null;
  /** Add-on line items only (the base fee is tracked separately). */
  lineItems: QuoteLineItem[];
  /** Sum of every *known* amount (base + add-ons). Always a number. */
  knownTotal: number;
  /** Final total: equals knownTotal, or null when any input is TBD. */
  total: number | null;
  /** True when the total can't be fully computed. */
  isTBD: boolean;
  /** True when the *base* fee itself is TBD (loan over $20MM / no band). */
  baseTBD: boolean;
  /** Labels explaining each TBD, e.g. ["Over $20MM", "Extra Negotiation"]. */
  tbdReasons: string[];
}

const BAND_BY_KEY = new Map(LOAN_BANDS.map((b) => [b.key, b]));
const ADDON_BY_KEY = new Map(ADDONS.map((a) => [a.key, a]));

function clampQty(n: number, addon: AddonDef): number {
  const min = addon.minQty ?? 1;
  const max = addon.maxQty ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.round(n), min), max);
}

export interface ComputeQuoteOptions {
  bandKey?: string;
  addonsKey?: string;
}

/**
 * Compute a quote from raw survey answers. Pure + deterministic.
 *
 * Expects:
 *   answers[bandKey]              → a LoanBand key (string)
 *   answers[addonsKey]            → an array of AddonDef keys (string[])
 *   answers[`${addonsKey}__qty`]  → { [addonKey]: number } quantity map
 */
export function computeQuote(
  answers: Record<string, unknown>,
  opts: ComputeQuoteOptions = {},
): Quote {
  const bandKey = opts.bandKey ?? "quoteLoanBand";
  const addonsKey = opts.addonsKey ?? "quoteAddons";

  const bandAnswer = answers[bandKey];
  const band =
    typeof bandAnswer === "string" ? BAND_BY_KEY.get(bandAnswer) ?? null : null;

  const selected = Array.isArray(answers[addonsKey])
    ? (answers[addonsKey] as unknown[]).filter(
        (x): x is string => typeof x === "string",
      )
    : [];
  const qtyMap = (answers[`${addonsKey}__qty`] ?? {}) as Record<string, number>;

  const tbdReasons: string[] = [];
  const baseTBD = !band || band.baseFee == null;
  if (band && band.baseFee == null) tbdReasons.push(band.label);

  const lineItems: QuoteLineItem[] = [];
  for (const key of selected) {
    const addon = ADDON_BY_KEY.get(key);
    if (!addon) continue;
    const quantity = addon.hasQuantity
      ? clampQty(qtyMap[key] ?? addon.minQty ?? 1, addon)
      : 1;
    const itemTBD = addon.unitPrice == null;
    if (itemTBD) tbdReasons.push(addon.label);
    lineItems.push({
      key: addon.key,
      label: addon.label,
      unitPrice: addon.unitPrice,
      quantity,
      amount: itemTBD ? null : (addon.unitPrice as number) * quantity,
      hasQuantity: Boolean(addon.hasQuantity),
      unitNote: addon.unitNote,
      isTBD: itemTBD,
    });
  }

  // Keep add-ons in the fee chart's canonical order for a tidy breakdown.
  lineItems.sort(
    (a, b) =>
      ADDONS.findIndex((x) => x.key === a.key) -
      ADDONS.findIndex((x) => x.key === b.key),
  );

  const knownTotal =
    (band?.baseFee ?? 0) +
    lineItems.reduce((sum, li) => sum + (li.amount ?? 0), 0);

  const isTBD = baseTBD || lineItems.some((li) => li.isTBD);

  return {
    baseKey: band?.key ?? null,
    baseLabel: band?.label ?? null,
    baseFee: band?.baseFee ?? null,
    lineItems,
    knownTotal,
    total: isTBD ? null : knownTotal,
    isTBD,
    baseTBD,
    tbdReasons,
  };
}

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUSD(n: number): string {
  return USD.format(n);
}
