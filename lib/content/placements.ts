/**
 * Body placements — each carries the composition hint fed to the prompt
 * engine, the aspect ratio for generation, and the copy for its SEO page at
 * /placements/{slug}.
 */

export type Placement = {
  slug: string;
  name: string;
  description: string;
  /** Fed into the prompt so compositions flow with the body part. */
  compositionHint: string;
  /** Higgsfield-supported aspect ratio for this canvas. */
  aspectRatio: string;
  sizeGuide: string;
  painNote: string;
};

export const PLACEMENTS: Placement[] = [
  {
    slug: 'forearm',
    name: 'Forearm',
    description:
      'The most popular placement in modern tattooing: visible when you want it, coverable when you don\'t, low on pain, and a natural vertical canvas that suits almost every style.',
    compositionHint: 'elongated vertical composition designed to flow along the forearm',
    aspectRatio: '9:16',
    sizeGuide: 'Typically 10–20cm tall; inner forearm suits scripts and fine line, outer suits bolder work.',
    painNote: 'Low — fleshy muscle with few nerve clusters. A common first-tattoo choice.',
  },
  {
    slug: 'upper-arm',
    name: 'Upper Arm / Bicep',
    description:
      'The classic canvas. Easily covered by a t-shirt sleeve, ages well because the skin is stable, and gives designs a gentle wrap around the muscle.',
    compositionHint: 'composition that wraps gently around the curve of the upper arm',
    aspectRatio: '3:4',
    sizeGuide: '10–18cm; leave room to grow into a half-sleeve later.',
    painNote: 'Low on the outer arm; the inner bicep is noticeably sharper.',
  },
  {
    slug: 'sleeve',
    name: 'Full Sleeve',
    description:
      'Shoulder to wrist, planned as one composition. The best sleeves are designed backwards from the body\'s flow — not assembled tattoo by tattoo. Our sleeve generations produce a full-arm concept you can break into sessions.',
    compositionHint: 'full sleeve composition flowing continuously from shoulder to wrist, designed around the arm\'s musculature',
    aspectRatio: '9:16',
    sizeGuide: 'A full sleeve is typically 4–8 sessions of work; plan the whole design before session one.',
    painNote: 'Varies across the arm — inner elbow and armpit-adjacent areas are the hardest.',
  },
  {
    slug: 'half-sleeve',
    name: 'Half Sleeve',
    description:
      'Shoulder to elbow (or elbow to wrist) as one cohesive piece. The half sleeve delivers sleeve-level impact while staying coverable in office shirts.',
    compositionHint: 'half sleeve composition flowing from shoulder to elbow as one cohesive piece',
    aspectRatio: '3:4',
    sizeGuide: 'Usually 2–4 sessions; upper half-sleeves are easiest to conceal.',
    painNote: 'Low to moderate — mostly forgiving muscle.',
  },
  {
    slug: 'wrist',
    name: 'Wrist',
    description:
      'Small, personal, always in your own eyeline. Wrist pieces suit minimal symbols, fine-line botanicals and short script — designs you want to see every day.',
    compositionHint: 'small delicate composition sized for the wrist',
    aspectRatio: '1:1',
    sizeGuide: '2–8cm; keep detail modest — tiny complexity blurs over years.',
    painNote: 'Moderate — thin skin over bone and tendons; quick sessions though.',
  },
  {
    slug: 'hand',
    name: 'Hand',
    description:
      'High-commitment, high-visibility. Hand tattoos fade faster than anywhere else (constant washing and sun) and demand bold, simple structure to stay readable through touch-ups.',
    compositionHint: 'bold simple composition sized for the back of the hand, strong readable structure',
    aspectRatio: '1:1',
    sizeGuide: 'Keep it bold and open — fine detail on hands blurs within a few years.',
    painNote: 'High — bone, tendon and constant movement. Also the most touch-up-prone spot.',
  },
  {
    slug: 'finger',
    name: 'Finger',
    description:
      'Tiny symbols, rings and single words. Finger ink is charming but famously impermanent — expect fading and plan a touch-up culture from day one.',
    compositionHint: 'tiny ultra-simple composition sized for a finger, single clear symbol or word',
    aspectRatio: '1:1',
    sizeGuide: '1–3cm; the simpler the design, the longer it survives.',
    painNote: 'Sharp but fast. Fading is the real cost — finger tattoos often need annual refreshes.',
  },
  {
    slug: 'shoulder',
    name: 'Shoulder',
    description:
      'A rounded cap of stable skin that flatters circular and radiating compositions — mandalas, florals, traditional pieces. Extends naturally toward chest or arm later.',
    compositionHint: 'circular radiating composition designed for the rounded shoulder cap',
    aspectRatio: '1:1',
    sizeGuide: '10–18cm caps; think about whether it will one day join a sleeve or chest piece.',
    painNote: 'Low — one of the most comfortable placements.',
  },
  {
    slug: 'chest',
    name: 'Chest',
    description:
      'A broad, symmetric canvas built for statement pieces — spread wings, paired designs, or one bold central motif. Chest work reads formally: it faces whoever faces you.',
    compositionHint: 'broad symmetric composition designed for the chest, horizontal spread',
    aspectRatio: '16:9',
    sizeGuide: 'Full-chest pieces are multi-session; single-side pieces 12–20cm.',
    painNote: 'Moderate; sternum and collarbone areas are considerably sharper.',
  },
  {
    slug: 'back',
    name: 'Back',
    description:
      'The largest canvas on the body. Back pieces are where Japanese, realism and large blackwork traditions do their most ambitious work — murals with room for a whole narrative.',
    compositionHint: 'large-scale mural composition designed for the full back',
    aspectRatio: '3:4',
    sizeGuide: 'Full-back work is a project — often 20+ hours. Design it complete before starting.',
    painNote: 'Varies: fleshy mid-back is easy, spine and lower back are not.',
  },
  {
    slug: 'spine',
    name: 'Spine',
    description:
      'A dramatic vertical line down the body\'s axis — ornamental drops, cyber sigilism, script and symmetric patterns love this placement. Precision matters: the design must sit dead-centre.',
    compositionHint: 'tall narrow perfectly symmetric composition designed to run down the spine',
    aspectRatio: '9:16',
    sizeGuide: '20–40cm vertical runs; symmetric designs are unforgiving of drift.',
    painNote: 'High — directly over vertebrae. Short sessions recommended.',
  },
  {
    slug: 'ribs',
    name: 'Ribs',
    description:
      'Intimate and mostly private, following the body\'s curve. Rib pieces suit flowing designs — florals, script, waves — that bend with the ribcage rather than fighting it.',
    compositionHint: 'flowing curved composition designed to follow the ribcage',
    aspectRatio: '2:3',
    sizeGuide: '10–25cm; designs with natural curve wear best here.',
    painNote: 'High — thin skin directly over bone, and breathing moves the canvas.',
  },
  {
    slug: 'hip',
    name: 'Hip',
    description:
      'Curved, elegant and easily concealed. Hip placements suit botanical vines, ornamental pieces and designs that trace the hip\'s natural line.',
    compositionHint: 'elegant curved composition tracing the hip line',
    aspectRatio: '2:3',
    sizeGuide: '8–20cm following the curve.',
    painNote: 'Moderate — sharper near the hip bone itself.',
  },
  {
    slug: 'thigh',
    name: 'Thigh',
    description:
      'A big, forgiving, private canvas that takes detail beautifully. Thigh pieces can go large without public commitment — a favourite for realism, neo-traditional and ornamental projects.',
    compositionHint: 'large vertical composition designed for the thigh, room for rich detail',
    aspectRatio: '3:4',
    sizeGuide: '15–30cm; the front and outer thigh are the most stable canvases.',
    painNote: 'Low on the outer thigh; inner thigh is much more sensitive.',
  },
  {
    slug: 'calf',
    name: 'Calf',
    description:
      'The lower-leg classic — a muscular vertical canvas that suits everything from traditional to blackwork. Shorts-visible in summer, hidden the rest of the year.',
    compositionHint: 'vertical composition designed for the calf muscle',
    aspectRatio: '9:16',
    sizeGuide: '12–25cm; wrap-around designs work well here.',
    painNote: 'Low to moderate; the shin side is sharper than the muscle.',
  },
  {
    slug: 'ankle',
    name: 'Ankle',
    description:
      'Small, subtle, classic. Ankle tattoos suit delicate botanicals, waves, and minimal symbols — and they survive dress codes almost everywhere.',
    compositionHint: 'small delicate composition sized for the ankle',
    aspectRatio: '1:1',
    sizeGuide: '3–8cm; allow for sock-line friction in aftercare.',
    painNote: 'Moderate to high — thin skin over bone.',
  },
  {
    slug: 'foot',
    name: 'Foot',
    description:
      'Charming and challenging: foot tattoos fade faster (friction, sun, shoes) and hurt more, but the placement suits flowing designs that follow the foot\'s arc.',
    compositionHint: 'flowing composition following the top of the foot',
    aspectRatio: '2:3',
    sizeGuide: '5–12cm; bold simple structure survives best.',
    painNote: 'High — bone and tendon with almost no padding.',
  },
  {
    slug: 'neck',
    name: 'Neck',
    description:
      'Bold territory. Neck pieces are permanent statements in every sense — visible in nearly all clothing. Side-neck suits flowing designs; back-of-neck suits compact symbols.',
    compositionHint: 'compact composition designed for the side or back of the neck',
    aspectRatio: '1:1',
    sizeGuide: '5–12cm; consider your industry honestly before booking.',
    painNote: 'High — thin skin, and the throat side is intense.',
  },
  {
    slug: 'behind-ear',
    name: 'Behind the Ear',
    description:
      'Tiny, intimate, almost-secret. Behind-the-ear placements suit minimal symbols, tiny botanicals and fine-line pieces revealed only when hair moves.',
    compositionHint: 'tiny minimal composition sized for behind the ear',
    aspectRatio: '1:1',
    sizeGuide: '2–5cm maximum; ultra-simple designs only.',
    painNote: 'Sharp but very fast — sessions are minutes, not hours.',
  },
  {
    slug: 'sternum',
    name: 'Sternum',
    description:
      'The underboob/centre-chest placement: ornate, symmetric, architectural. Ornamental and cyber-sigilism designs radiating from the body\'s centreline were made for this canvas.',
    compositionHint: 'ornate symmetric composition radiating from the sternum centreline',
    aspectRatio: '3:4',
    sizeGuide: '10–20cm; symmetric designs demand precise placement.',
    painNote: 'High — directly over bone at the body\'s centre.',
  },
];

export function placementBySlug(slug: string): Placement | undefined {
  return PLACEMENTS.find((p) => p.slug === slug);
}
