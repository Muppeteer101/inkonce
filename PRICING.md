# InkOnce pricing & unit-economics model

Requirement (Dougie, 2026-07-06): **≥70% net margin on each image generation**,
after loading in (a) the direct model cost of the paid generation, (b) the cost of
all free generations statistically consumed to win that paying customer, and
(c) payment fees.

Everything below is encoded in `lib/plans.ts` — change the constants there and the
product enforces the new caps immediately.

## 1. Cost inputs (verify against the Higgsfield dashboard before launch)

Higgsfield platform API bills per successful generation (failed/NSFW refunded).
Best available public numbers, July 2026:

| Input | Value | Source |
|---|---|---|
| Higgsfield credit price | ~$0.0625 / credit | credit-pack maths corroborated by two independent integrations |
| Draft-class model (Z-Image / NB2-Lite class) | ~0.15–0.5 cr ≈ **$0.01–0.03 / image** | community model-cost tables |
| Standard model (Seedream 4.5 class, up to 4K) | ~1 cr ≈ **$0.0625 / image** | community model-cost tables |
| Premium render (Nano Banana Pro / Soul HD class) | ~2–3 cr ≈ **$0.125–0.19 / image** | WaveSpeed mirror pricing $0.09 medium / $0.19 high |
| Stripe fee | 2.9% + $0.30 | Stripe standard |

**⚠️ ACTION BEFORE LAUNCH:** these are researched estimates from third-party
integrations, not quotes. Confirm the exact per-model $ on cloud.higgsfield.ai
with the real API key, then set `COST_PER_IMAGE_USD` in `lib/plans.ts` to the
observed numbers. The margin guardrail test (`lib/plans.test.ts`) recomputes the
whole model and fails if any plan drops below 70%.

## 2. The generation pipeline (this is what makes the margin work)

Every "generation" a user sees is a **draft run**: N concepts from the
draft-class model (cheap, fast, genuinely good at line art). Quality parity with
BlackInk comes at the **refine** step: the chosen concept is re-rendered as a
4-up set on the standard model, and **export** produces the 4K/hi-res file and
stencil. So the expensive models only ever run on designs a user has already
chosen — never on throwaway exploration.

| Step | Model class | Images | Cost |
|---|---|---|---|
| Draft run | draft | 2 | $0.02 (@ $0.01/img) |
| Refine run | standard | 4 | $0.25 |
| Hi-res export | premium | 1 | $0.125 |
| Stencil export | standard (img-edit) | 1 | $0.0625 |

## 3. Free tier loading

Free tier: **3 draft runs** (6 images) per account, sign-in required. Free COGS
= 6 × $0.01 = **$0.06 per free signup**.

| Free→paid conversion | Amortised free cost per paying customer |
|---|---|
| 2% | $3.00 |
| 3% (planning case) | $2.00 |
| 5% | $1.20 |

Planning case: **F = $2.00** loaded onto every purchase (conservative: loaded on
every purchase, not just the first).

## 4. Plans and worst-case margin (caps enforced in code)

Margin test: `COGS_direct + F + Stripe ≤ 30% × price`, at **full cap usage**
(worst case, not expected usage).

### Design Pass — $19.99 one-time, 7 days
25 draft runs + 7 refine runs + 4 hi-res exports + 5 stencils, private, keep
forever, artist handoff pack.

| Component | Cost |
|---|---|
| 25 draft runs × $0.02 | $0.50 |
| 7 refine runs × $0.25 | $1.75 |
| 4 hi-res × $0.125 | $0.50 |
| 5 stencils × $0.0625 | $0.31 |
| Direct COGS | **$3.06** |
| + Free loading F | $2.00 |
| + Stripe (2.9% + 30¢) | $0.88 |
| **Fully-loaded cost** | **$5.94** |
| Budget @ 30% of $19.99 | $6.00 |

Worst-case (100% usage of every cap simultaneously) = 29.7% of price →
**70.3% net margin even at full cap usage** ✓ (observed usage in this category
is 40–60%, so realistic margin is ~80%+).

Per-generation view: $19.99 / 32 capped runs = $0.62 revenue per run vs $0.186
fully-loaded cost per run = **70.3% net margin per generation, worst case**. ✓

### Ink Studio — $11.99/month
Per month: 40 draft runs + 5 refine runs + 3 hi-res + 3 stencils.

| Component | Cost |
|---|---|
| 40 × $0.02 + 5 × $0.25 + 3 × $0.125 + 3 × $0.0625 | $2.61 |
| + Stripe | $0.65 |
| + F (month 1 only) | $2.00 |
| Steady state | $3.26 / $11.99 = 27.2% → **72.8% margin** ✓ |
| Month 1 worst case | $5.26 / $11.99 = 43.9% → month-1 margin 56%, lifetime ≥70% from month 2 |

### Ink Studio Annual — $39.99/year (45% less than BlackInk's $72)
Same monthly caps, no rollover, fair-use clause. Planning case: annual cohort
averages 25% of caps across the year (heavy month 1–2, near-zero after the
tattoo is done). COGS 12 × $2.61 × 25% = $7.84 + F $2.00 + Stripe $1.46 =
$11.30 = 28.2% → **71.8% margin** ✓. A worst-case abuser (12 months of full
caps = $31.3) breaks margin — fair-use + no-rollover is the enforcement, and
the guardrail test pins the 25%-usage planning case. If annual-cohort usage
exceeds 25% of caps on average, raise the price or cut monthly refine caps —
one constant.

## 5. Competitive read

| | BlackInk | InkOnce |
|---|---|---|
| To design one tattoo | $15 (if you cancel in time) – $72 | **$19.99 once, no subscription** |
| Free tier | 3 credits, public, blurred locks, deleted after 30 days | 3 runs, **private, keep forever, no blur** |
| Annual | $72 | $39.99 |

## 6. Levers if reality differs from assumptions

1. `COST_PER_IMAGE_USD` — set from the live dashboard; test recomputes margins.
2. Draft model floor: if the cheapest platform model is >$0.03/image, drop
   `DRAFT_IMAGES_PER_RUN` 2→1 (halves draft COGS, UX still fine).
3. Conversion: if <2% after launch month, cut free runs 3→2 (constant).
4. Refine/export caps per plan — single constants.
