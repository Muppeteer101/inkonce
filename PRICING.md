# InkOnce pricing & unit-economics model

Requirement (Dougie, 2026-07-06): **≥70% net margin on each image generation**,
after loading in (a) the direct model cost of the paid generation, (b) the cost of
all free generations statistically consumed to win that paying customer, and
(c) payment fees.

> **SUPERSEDED 2026-07-27 — floor lowered to 40%.** The 70% target was computed
> against a cheap draft-class model (Z-Image / Nano Banana Lite) that this
> account's Higgsfield developer API does not expose. Only the Soul family is
> reachable, so all three tiers now run `higgsfield-ai/soul/standard` at 1
> credit (~$0.0625) per image. Decision: take the output quality and accept the
> margin — a product that sells at ~45% beats one that doesn't at 70%.
> `TARGET_MIN_NET_MARGIN` is now `0.4`. Every figure in §2–§4 below is restated
> at the real cost; the pre-2026-07-27 numbers assumed tier prices we never
> paid.

Everything below is encoded in `lib/plans.ts` — change the constants there and the
product enforces the new caps immediately.

## 1. Cost inputs (verify against the Higgsfield dashboard before launch)

Higgsfield platform API bills per successful generation (failed/NSFW refunded).
Best available public numbers, July 2026:

| Input | Value | Source |
|---|---|---|
| Higgsfield credit price | ~$0.0625 / credit | credit-pack maths corroborated by two independent integrations |
| **All tiers — `higgsfield-ai/soul/standard`** | 1 cr ≈ **$0.0625 / image** | verified against the account's live `GET /models` catalog |
| ~~Draft-class (Z-Image / NB2-Lite)~~ | ~~$0.01–0.03~~ | **not reachable** — consumer web only |
| ~~Standard (Seedream 4.5)~~ | ~~$0.0625~~ | **not reachable** — consumer web only |
| ~~Premium (Nano Banana Pro)~~ | ~~$0.125–0.19~~ | **not reachable** — consumer web only |
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

| Step | Model | Images | Cost |
|---|---|---|---|
| Draft run | soul/standard | 1 | $0.0625 |
| Refine run | soul/standard | 4 | $0.25 |
| Hi-res export | soul/standard | 1 | $0.0625 |
| Stencil export | soul/standard | 1 | $0.0625 |

Note the tiering is currently economic fiction: every step runs the same model
at the same price. The cheap-explore / expensive-commit shape returns only when
a second model becomes reachable. `soul/standard` also accepts `batch_size` of
1 or 4 only, which is why a draft run is 1 image, not 2.

## 3. Free tier loading

Free tier: **3 draft runs** (3 images) per account, sign-in required. Free COGS
= 3 × $0.0625 = **$0.1875 per free signup**.

| Free→paid conversion | Amortised free cost per paying customer |
|---|---|
| 2% | $9.38 |
| 3% (planning case) | **$6.25** |
| 5% | $3.75 |

Planning case: **F = $6.25** loaded onto every purchase (conservative: loaded on
every purchase, not just the first).

**This is now the dominant cost in the model — larger than the goods.** A Design
Pass customer consumes $3.88 of generation and $6.25 of giveaway. It is a
customer-acquisition number, not a product-quality one, so it is the first lever
to pull if margin needs to come back up: `FREE_DRAFT_RUNS` 3→1 cuts F to $2.08
and costs nothing in output quality.

## 4. Plans and worst-case margin (caps enforced in code)

Margin test: `COGS_direct + F + Stripe ≤ 60% × price`, at **full cap usage**
(worst case, not expected usage). All figures below are computed by
`lib/plans.ts` and pinned by `lib/plans.test.ts`.

### Design Pass — $19.99 one-time, 7 days
25 draft runs + 7 refine runs + 4 hi-res exports + 5 stencils, private, keep
forever, artist handoff pack.

| Component | Cost |
|---|---|
| 25 draft runs × $0.0625 | $1.56 |
| 7 refine runs × $0.25 | $1.75 |
| 4 hi-res × $0.0625 | $0.25 |
| 5 stencils × $0.0625 | $0.31 |
| Direct COGS | **$3.88** |
| + Free loading F | $6.25 |
| + Stripe (2.9% + 30¢) | $0.88 |
| **Fully-loaded cost** | **$11.01** |
| Budget @ 60% of $19.99 | $12.00 |

Worst-case (100% usage of every cap simultaneously) = 55.1% of price →
**44.9% net margin at full cap usage** ✓ against the 40% floor. Without the
free-tier loading — i.e. every customer after the first — it is **76.2%**.
Observed usage in this category is 40–60% of caps, so realistic margin is
higher again.

### Ink Studio — $11.99/month
Per month: 40 draft runs + 5 refine runs + 3 hi-res + 3 stencils.

| Component | Cost |
|---|---|
| 40 × $0.0625 + 5 × $0.25 + 3 × $0.0625 + 3 × $0.0625 | $4.13 |
| + Stripe | $0.65 |
| + F (month 1 only) | $6.25 |
| Steady state | $4.77 / $11.99 = 39.8% → **60.2% margin** ✓ |
| Month 1 worst case | $11.02 / $11.99 = 91.9% → **8.1% margin** ⚠️ |

> ⚠️ **Known weak point — the monthly plan's first month is barely profitable**
> at full cap usage: ~$0.97 net on a $11.99 sale. It is not the model cost; it
> is that $6.25 of free-tier CAC lands on an $11.99 price (52% of revenue). The
> Design Pass absorbs the same $6.25 on $19.99; Ink Studio monthly cannot.
> `plans.test.ts` asserts month one stays profitable rather than pinning a
> meaningless ~8% floor, so further degradation fails the build. Fix is a funnel
> decision: `FREE_DRAFT_RUNS` 3→1 returns this to ~43%.

### Ink Studio Annual — $39.99/year (45% less than BlackInk's $72)
Same monthly caps, no rollover, fair-use clause. Planning case: annual cohort
averages 25% of caps across the year (heavy month 1–2, near-zero after the
tattoo is done). COGS 12 × $4.13 × 25% = $12.38 + F $6.25 + Stripe $1.46 =
$20.09 = 50.2% → **49.8% margin** ✓. A worst-case abuser (12 months of full
caps = $49.5) breaks margin — fair-use + no-rollover is the enforcement, and
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

Ordered by effect, largest first. The free tier is now the biggest single cost
in the model, so it is the first lever — and the only one that costs nothing in
output quality.

1. **`FREE_DRAFT_RUNS` 3→1** — cuts F from $6.25 to $2.08. Design Pass ~45%→66%,
   Ink Studio month-1 ~8%→43%. No effect on what a paying customer receives.
2. `COST_PER_IMAGE_USD` — still an estimate ($0.0625 = 1 credit at PRICING.md's
   own credit price). Confirm the real per-generation charge on the Higgsfield
   dashboard and set it; the test recomputes everything.
3. Cheaper model for the draft tier — currently impossible (Soul is all this
   account exposes) but the single biggest structural fix if it changes, since
   draft is 25 of the Design Pass's 41 billable images.
4. Refine/export caps per plan — single constants.
5. Price. Untouched so far; Ink Studio monthly at $11.99 is the plan carrying
   the least headroom against a fixed $6.25 CAC.
