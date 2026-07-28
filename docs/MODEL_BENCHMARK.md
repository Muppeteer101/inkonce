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
| fofr/sdxl-fresh-ink | $0.014 | — | **Wrong shape for this product.** Fine-tuned on *photos of freshly inked tattoos* — i.e. tattoos on skin, precisely what FLASH_SUFFIX suppresses. Useful later for on-skin previews; not a flash model. |

## Assumptions this overturned

The rebuild plan asserted three things that the output does not support:

1. **"Ideogram owns lettering."** It doesn't. All five models spelled "Stay Gold"
   correctly with no garbling. flux-schnell and seedream-4 produced better
   *tattoo script* — and ideogram put it on a grey ground.
2. **"`fofr/sdxl-fresh-ink` is the ready-made tattoo model."** It is trained on
   skin photos, so it fights the flash contract on every generation.
3. **"FLUX is the all-rounder."** flux-*dev* was the weakest paid option tested.
   flux-*schnell*, at 1/8 the price, beat it.

It also settles the plan's own fidelity bar. Soul allegedly rendered Binky as a
skeleton; **every** model here drew a living horse, and both seedream-4 and
nano-banana got Death, the robe, and the Death of Rats right. The engine really
was the constraint.

## Chosen defaults

- **draft → flux-schnell.** Exploration wants cheap and fast, and at $0.003 it is
  good enough that the quality gap only matters once a concept is chosen.
- **refine / hires → seedream-4.** Best quality where the user has committed.
- **stencil → seedream-4.** Image-to-image capable and holds line structure.
- **No lettering override.** The evidence removed the reason for one.

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

- Prices are Replicate's published per-image rates. **Reconcile against the
  billing dashboard before trusting them** — PRICING.md §1 has been wrong about
  model costs once already.
- n=1 per cell. Enough to eliminate clearly-worse options; not enough to split
  seedream-4 from nano-banana on quality. Re-run with seeds before treating the
  ordering as settled.
- Judged by one reviewer against the flash contract, not blind-scored, and not
  compared against BlackInk output. The competitive bar in the plan's §5 remains
  unmeasured.
- **Account is throttled**: below $5.00 credit Replicate caps prediction creation
  at 6/minute with a burst of 1. Serial only — production needs credit first.
