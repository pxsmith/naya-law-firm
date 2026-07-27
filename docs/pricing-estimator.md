# How the fixed-fee estimator works

*A plain-language walkthrough of the pricing survey on `/pricing`. Every number and rule below is taken directly from the code.*

---

## The calculation

The whole calculation is deliberately simple: **a base fee for the loan size, plus flat add-ons.** That's it — no percentages, no hidden multipliers.

### 1. The base fee comes from the loan size

The person picks which range their loan falls into, and each range has a set price:

| Loan size | Base fixed fee |
|---|---|
| Under $2MM | $10,750 |
| $2MM – $3.499MM | $12,750 |
| $3.5MM – $5MM | $14,250 |
| $5MM – $10MM | $16,750 |
| $10MM – $20MM | $19,750 |
| Over $20MM | *no set price — see "When it can't give a number" below* |

### 2. Add-ons get added on top

They then check off anything the deal involves. Each one has a fixed price. Some are a single flat charge, and some are **per item** (they get a small quantity picker):

| Add-on | Price |
|---|---|
| New York / CEMA | $3,950 |
| Master Lease | $1,950 |
| Tenancy-in-Common (TIC) | $3,450 |
| Lease Review / SNDA / Estoppel | $1,950 **per lease** |
| Pledge of Equity | $1,450 **per pledge** |
| Estoppels Only | $100 **each** |
| Condo | $3,450 |
| REA Estoppel / Complicated Title | $2,950 |
| Non-Consolidation Opinion Review | $2,000 |
| Delaware SPE / DE Opinions | $2,000 |
| Extra Negotiation | *quoted separately — see below* |

### 3. The total is just addition

**Base fee + each add-on (price × quantity for the per-item ones).**

**Worked example** — a $4M loan with a Master Lease and 3 lease reviews:

- Base ($3.5M–$5M): **$14,250**
- Master Lease: **$1,950**
- Lease Review ×3: $1,950 × 3 = **$5,850**
- **Total: $22,050**

### 4. When it can't give a number

Two things are marked "quoted per deal" on purpose:

- **A loan over $20MM**, and
- **"Extra Negotiation"** (heavily negotiated deals)

If either is selected, the estimator won't invent a number. Instead it shows a "from $X" figure (or, for the big loans, no number at all) and points the person to **book a call** to finalize. This is intentional — it avoids showing a misleading price on the deals that genuinely need a human.

### One detail worth knowing

The survey questions **before** the pricing part (role, loan sizes, opinions on fixed fees, etc.) are research questions — those answers go to the Google Form / Sheet. The pricing questions at the end are **not** sent anywhere; they're only used to calculate the estimate on screen.

---

## How to edit the fees

**Every dollar figure lives in one file: `src/lib/pricing.ts`.** It is the single source of truth — the survey reads its options *from* that file, so when a number changes there, both the price shown in the survey and the math behind the total update together. They can't get out of sync.

- To change a **base fee**, edit the `baseFee` number for that loan band.
- To change an **add-on price**, edit its `unitPrice`.
- The **labels** and the small **help text** under each option live in that same file too.

**One honest caveat:** this is a code file, not a settings page. Editing it means a small code change and a redeploy — quick for a developer, but not something you'd change from a dashboard.
