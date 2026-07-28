# Step 0 — model benchmark

Evidence for the router defaults in `lib/ai/router.ts`. Run 2026-07-28 against
Replicate, using prompts produced by the **real** `buildTattooPrompt` pipeline
(not hand-written), so this measures what InkOnce would actually ship.

Method: five test cases spanning the styles that stress different things —
reference fidelity, solid blackwork, delicate line, glyph rendering, and colour
composition — one image per model per case, judged on output.

| Case | Prompt subject | Style |
|---|---|---|
| `fidelity` | Death from the disc world novels riding Binky, his **living** white horse, with the Death of Rats between his ears | blackwork |
| `blackwork` | a snake coiled around a dagger | blackwork |
| `fineline` | a moth with moon phases above it | fine-line |
| `lettering` | the words "Stay Gold" | script-lettering |
| `japanese` | a koi carp swimming up a waterfall with maple leaves | japanese-irezumi |

## Results

| Model | $/image | Avg latency | Verdict |
|---|---|---|---|
| **seedream-4** | $0.03 | 12.5s | **Best all-rounder.** Bold confident linework, strongest silhouettes, clean near-white ground on every case. Won or tied every category. |
| **nano-banana** | $0.039 | 5.7s | **Best character fidelity**, fastest. Rendered Death, the scythe, the living horse *and* the Death of Rats correctly. Weak at lettering — returned plain italic caps, not script. |
| **flux-schnell** | **$0.003** | 15.3s | **Astonishing value.** Clean, on-brief, correct flash framing. Occasionally misses a detail (drew one moon where the brief said moon *phases*). 10× cheaper than anything else. |
| flux-dev | $0.025 | 38.3s | **Skip.** Soft, blurry, muddy mid-tones on fine-line — the exact "heals into mush" failure PRICING/prompts warn about. Slowest and 8× the price of schnell for worse output. |
| ideogram-v3 | $0.03 | 8.7s | Strong style interpretation, **but tinted backgrounds on every single case** (cream, grey, pink). Violates the flash contract's "plain solid white background". Disqualifying without post-processing. |
| fofr/sdxl-fresh-ink | <$0.01 | 10s | **Disqualified.** Fine-tuned on *photos of freshly inked tattoos*. Output was rendered art on **black and grey grounds inside decorative circular frames** — violating "plain solid white background", "no frame, no border" and "no photo" at once. Beautiful; wrong product. Keep for a future on-skin preview. |

### Tattoo-specific fine-tunes

The plan named only `fresh-ink`. Searching Replicate properly turns up a family
of tattoo LoRAs, and two of them earn their place.

| Model | $/image | Verdict |
|---|---|---|
| **tattzy25/heavy_hand_dark** | **$0.01** | **Wins blackwork outright.** "Heavy contrast blackwork trained straight from my portfolio." Produced genuine solid filled shapes where general models default to scale-texture illustration — and at a third of seedream-4's price. The one style override in the router. |
| **tattzy25/tattty_4_all** | **$0.01** | Trained on 678 **sketch designs**, not skin photos. Correct characters on the fidelity case, clean white ground, good shading. Competitive with seedream-4 at a third the price — the closest available analogue to BlackInk's own fine-tune, and worth re-testing as the refine default. |
| tattzy25/fontivate-v0 | $0.01 | Clean lettering, but no better than the $0.003 default. Earns no override. |

## Assumptions this overturned

The rebuild plan asserted three things that the output does not support:

1. **"Ideogram owns lettering."** It doesn't. All five models spelled "Stay Gold"
   correctly with no garbling. flux-schnell and seedream-4 produced better
   *tattoo script* — and ideogram put it on a grey ground.
2. **"`fofr/sdxl-fresh-ink` is the ready-made tattoo model."** It is trained on
   skin photos, so it fights the flash contract on every generation.
3. **"FLUX is the all-rounder."** flux-*dev* was the weakest paid option tested.
   flux-*schnell*, at 1/8 the price, beat it.

## ⚠️ What this benchmark does NOT show

**Read this before quoting any result above.**

Every prompt here was written as clean art direction — "a snake coiled around a
dagger", "a moth with moon phases above it". Those are not what a user types.
The fidelity case was worse: the plan's failing input was the vague *"A tattoo
of death, from the disc world novels"*, and it was tested here as a hand-written
brief naming Death, Binky-as-living-horse and the Death of Rats explicitly. That
is the interpretation step doing the work, not the model.

So this measures **the renderer given a good prompt**. It does not measure the
product, which is a description box taking ordinary language.

### The real test

Five phrases as actually typed, through the unmodified pipeline, on seedream-4
(the best model above):

| Typed | Rendered |
|---|---|
| `a lion but make it look hard` | **a manga boy holding a dagger — no lion at all** |
| `A tattoo of death, from the disc world novels` | generic hooded reaper with a cross-topped staff — no Binky, no Death of Rats |
| `something for my nan who passed away last year` | a stock flower; nothing memorial |
| `i need something to cover my exs name on my arm` | a horned demon face; does not address covering anything |
| `something about getting through depression` | a phoenix rising from broken chains — clichéd but on-brief |

**One acceptable result in five.** And note row two: the naive Discworld input
reproduces the exact original bug *on the best available model*. That failure
was attributed to Soul. It survives the engine change intact — because nothing
in the pipeline understands the request. `buildTattooPrompt` concatenates:

```
`${style.promptFragment} tattoo design of ${subject}`
```

…so the model receives `tattoo design of i need something to cover my exs name
on my arm`.

### Interpretation is the missing variable

Same model, same style, same pipeline — only the subject text replaced with a
hand-written brief of the kind `lib/ai/brain.ts` is meant to produce:

| Case | Naive | Interpreted |
|---|---|---|
| lion | manga boy with a dagger | snarling lion head, heavy mane, scarred brow |
| nan | a stock flower | forget-me-not bouquet, ribbon-tied, robin perched |
| discworld | generic reaper, cross staff | Death with hourglass **and** scythe, on a living white horse, Death of Rats riding its neck |
| depression | phoenix from broken chains | **worse** — lotus and storm cloud rendered as two disconnected elements |

Three clear wins, **one loss**, and the loss matters: richer description is not
automatically better. "A lotus rising toward a break in storm clouds" split into
a cloud band floating above a separate flower. A tattoo-aware interpreter must
produce a *single unified composition*, not merely a longer sentence — which is
a real constraint on the brain's system prompt, and a thing to evaluate rather
than assume.

### Consequence

The engine work was necessary — Soul really was the only reachable family, the
cost model really did price unreachable tiers, and `cleanSubject` really was
destroying intent. But it is **not sufficient**, and the plan says so itself:
§2 ranks the intelligence layer above the workflow as the hard-to-copy edge.
On this evidence the remaining quality gap is almost entirely interpretation,
not rendering. Nothing above should be read as "the output problem is solved".

## Chosen defaults

- **draft → flux-schnell.** Exploration wants cheap and fast, and at $0.003 it is
  good enough that the quality gap only matters once a concept is chosen.
- **refine / hires → seedream-4.** Best quality where the user has committed.
- **stencil → seedream-4.** Image-to-image capable and holds line structure.
- **blackwork → heavy-hand.** The one place routing pays. Solid fills beat the
  general models' scale texture, and it costs a third as much.
- **No lettering override.** The evidence removed the reason for one — which is
  worth recording, because the plan predicted the opposite.

## Cost consequence

Moving off Soul Standard ($0.0625 flat, all tiers) is not a small saving —
it changes the shape of the business, because draft cost is multiplied ~200× by
the free tier (3 free runs ÷ 3% conversion).

| Config | Design Pass m1 | Ink Studio m1 | CAC |
|---|---|---|---|
| Soul Standard (today) | 44.9% | **8.1%** | $6.25 |
| flux-schnell + seedream-4 | **88.2%** | **84.6%** | **$0.30** |

The known weak point — Ink Studio's first month at ~$0.97 net — disappears.
`TARGET_MIN_NET_MARGIN` was lowered to 0.4 to reflect Soul-era reality; on these
models the original 70% target is comfortably achievable again, so raise it back
when the provider swap lands.

## Caveats

- Prices for seedream-4, the tattoo LoRAs and fresh-ink are **observed from the
  Replicate billing dashboard**, not published estimates. flux-schnell and
  flux-dev remain published rates and should be reconciled the same way.
  Notably the tattoo LoRAs bill at $0.01, a third of the $0.03 first assumed.
- n=1 per cell. Enough to eliminate clearly-worse options; not enough to split
  seedream-4 from nano-banana on quality. Re-run with seeds before treating the
  ordering as settled.
- Judged by one reviewer against the flash contract, not blind-scored, and not
  compared against BlackInk output. The competitive bar in the plan's §5 remains
  unmeasured.
- **Account is throttled**: Replicate caps prediction creation at 6/minute with
  a burst of 1 "while you have less than $5.0 in credit". This persisted with
  the dashboard reporting **$18.52 credit remaining**, so the limiter is
  evidently not counting that balance — likely promotional credit rather than a
  purchased one. Resolve before production; serial-only serves no one.
