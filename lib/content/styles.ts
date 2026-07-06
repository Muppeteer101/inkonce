/**
 * The 28 tattoo styles — matching BlackInk's breadth ("28+ styles") with
 * hand-written prompt fragments that anchor the model in each genre's real
 * technique vocabulary. Every entry powers a programmatic SEO page at
 * /styles/{slug} and idea×style pages at /ideas/{idea}/{style}.
 */

export type ColorMode = 'blackwork' | 'black-and-grey' | 'color';

export type TattooStyle = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Technique vocabulary injected into the prompt engine. */
  promptFragment: string;
  defaultColorMode: ColorMode;
  traits: string[];
  /** Idea slugs this style famously suits (internal linking). */
  goodFor: string[];
};

export const STYLES: TattooStyle[] = [
  {
    slug: 'american-traditional',
    name: 'American Traditional',
    tagline: 'Bold lines, brighter forever.',
    description:
      'The sailor-era classic: thick black outlines, a limited palette of red, yellow and green, and iconic motifs that read from across a room. Traditional designs are built to age — the bold structure holds its shape for decades, which is why the style has never gone out of fashion.',
    promptFragment:
      'american traditional old school, bold heavy black outlines, limited palette of deep red, golden yellow and forest green, flat controlled shading, iconic sailor jerry composition',
    defaultColorMode: 'color',
    traits: ['Bold outlines', 'Limited palette', 'Ages superbly', 'Iconic motifs'],
    goodFor: ['eagle', 'anchor', 'rose', 'dagger', 'snake', 'heart'],
  },
  {
    slug: 'neo-traditional',
    name: 'Neo-Traditional',
    tagline: 'The classic, evolved.',
    description:
      'Neo-traditional keeps the strong outlines of American Traditional but opens the palette and adds depth: dimensional shading, decorative flourishes, art-nouveau framing. It suits portraits of animals and ornate natural subjects that want more realism than old school allows without losing tattoo-first boldness.',
    promptFragment:
      'neo-traditional, bold varied-weight outlines, rich jewel-tone palette, dimensional shading, decorative art nouveau flourishes and framing',
    defaultColorMode: 'color',
    traits: ['Varied line weight', 'Jewel tones', 'Decorative framing'],
    goodFor: ['owl', 'wolf', 'peony', 'lion', 'moth', 'raven'],
  },
  {
    slug: 'fine-line',
    name: 'Fine Line',
    tagline: 'Whisper-weight precision.',
    description:
      'Single-needle delicacy: thin, precise lines, minimal shading, elegant restraint. Fine line is the defining style of the last decade — subtle enough for first tattoos and visible placements, precise enough for botanical detail and script. Good fine line demands clean, confident linework, which is exactly what we optimise for.',
    promptFragment:
      'fine line single needle, delicate thin precise linework, minimal soft shading, elegant restrained composition, airy negative space',
    defaultColorMode: 'blackwork',
    traits: ['Single-needle', 'Subtle', 'First-tattoo friendly'],
    goodFor: ['butterfly', 'lotus', 'hummingbird', 'sun-and-moon', 'cherry-blossom', 'stars'],
  },
  {
    slug: 'blackwork',
    name: 'Blackwork',
    tagline: 'Solid black. No apologies.',
    description:
      'Bold fields of solid black ink — from graphic shapes and heavy ornamental bands to dramatic silhouettes. Blackwork is high-contrast by definition, heals beautifully on every skin tone, and makes a statement no colour piece can. It spans everything from brutal minimalism to dense decorative work.',
    promptFragment:
      'blackwork, solid heavy black ink fills, strong graphic silhouette, high contrast, dramatic negative space',
    defaultColorMode: 'blackwork',
    traits: ['Solid black', 'Every skin tone', 'Graphic impact'],
    goodFor: ['raven', 'snake', 'mountain', 'octopus', 'grim-reaper', 'wave'],
  },
  {
    slug: 'realism',
    name: 'Realism',
    tagline: 'Photographic ink.',
    description:
      'Photorealistic rendering in skin: portraits, animals and objects with true-to-life light, texture and depth. Realism is technically demanding — designs need a strong tonal structure underneath the detail or they blur with age, so our realism designs keep deliberate contrast anchors.',
    promptFragment:
      'hyperrealistic tattoo realism, photographic detail, true-to-life light and texture, strong tonal structure and contrast anchors',
    defaultColorMode: 'black-and-grey',
    traits: ['Photographic', 'High detail', 'Portrait-grade'],
    goodFor: ['lion', 'tiger', 'wolf', 'clock', 'eagle', 'bear'],
  },
  {
    slug: 'black-and-grey',
    name: 'Black & Grey',
    tagline: 'A thousand shades of smoke.',
    description:
      'The Los Angeles classic: black ink diluted into smooth grey washes, from soft smoke to deep shadow. Black and grey suits portraits, religious pieces and anything cinematic. It ages gracefully and photographs beautifully — the most versatile shading language in tattooing.',
    promptFragment:
      'black and grey, smooth graduated grey wash shading, soft smoke transitions, deep shadow anchors, cinematic tonal range',
    defaultColorMode: 'black-and-grey',
    traits: ['Smooth gradients', 'Cinematic', 'Versatile'],
    goodFor: ['angel', 'clock', 'rose', 'skull', 'medusa', 'memorial'],
  },
  {
    slug: 'japanese-irezumi',
    name: 'Japanese (Irezumi)',
    tagline: 'Centuries of flow.',
    description:
      'The traditional Japanese canon: dragons, koi, tigers, peonies and waves composed to flow with the body, framed by wind bars and water. Irezumi is a complete visual system with centuries of rules about pairing, direction and season — our designs respect that grammar rather than pasting motifs together.',
    promptFragment:
      'traditional japanese irezumi, flowing dynamic composition with wind bars and finger waves, bold outlines, traditional motif grammar, rich muted palette',
    defaultColorMode: 'color',
    traits: ['Body flow', 'Traditional canon', 'Large-scale'],
    goodFor: ['dragon', 'koi-fish', 'tiger', 'peony', 'snake', 'wave'],
  },
  {
    slug: 'tribal',
    name: 'Tribal',
    tagline: 'The oldest language in ink.',
    description:
      'Bold black patterns drawn from Polynesian, Maori and Bornean traditions — interlocking shapes that wrap the body\'s contours. Modern tribal ranges from heritage-respectful pattern work to contemporary graphic interpretations. Solid black, built for muscle flow, and utterly permanent in feel.',
    promptFragment:
      'bold tribal, solid black interlocking patterns inspired by polynesian and maori traditions, contour-wrapping composition, symmetric flow',
    defaultColorMode: 'blackwork',
    traits: ['Solid black', 'Contour-wrapping', 'Heritage patterns'],
    goodFor: ['shark', 'sun-and-moon', 'turtle', 'wave', 'scorpion'],
  },
  {
    slug: 'geometric',
    name: 'Geometric',
    tagline: 'Sacred mathematics.',
    description:
      'Precise lines, repeating polygons, sacred-geometry grids and impossible symmetry. Geometric work rewards precision — a wobble ruins it — so designs are built on clean construction lines and balanced weight. Pairs brilliantly with animals and nature split into faceted, half-geometric compositions.',
    promptFragment:
      'geometric, precise ruler-straight linework, sacred geometry grids, repeating polygons, perfect symmetry, balanced line weight',
    defaultColorMode: 'blackwork',
    traits: ['Precision', 'Symmetry', 'Sacred geometry'],
    goodFor: ['mandala', 'wolf', 'bear', 'mountain', 'compass', 'tree-of-life'],
  },
  {
    slug: 'dotwork',
    name: 'Dotwork',
    tagline: 'Built one dot at a time.',
    description:
      'Shading and texture created entirely from individual dots — stippled gradients that give designs a soft, engraved, almost meditative quality. Dotwork suits mandalas, ornamental pieces and anything spiritual; it heals softly and its texture is unmistakably handmade.',
    promptFragment:
      'dotwork stippling, shading built entirely from fine dots, engraved meditative texture, smooth stippled gradients',
    defaultColorMode: 'blackwork',
    traits: ['Stippled shading', 'Soft healing', 'Ornamental'],
    goodFor: ['mandala', 'lotus', 'moth', 'sun-and-moon', 'tree-of-life'],
  },
  {
    slug: 'minimalist',
    name: 'Minimalist',
    tagline: 'Only what matters.',
    description:
      'The fewest possible lines carrying the most possible meaning. Minimalist tattoos are small, quiet and deliberate — a single-stroke animal, a tiny symbol, a word. The discipline is in what gets left out; a great minimalist design cannot lose a single line without losing the idea.',
    promptFragment:
      'minimalist, extreme economy of line, single continuous strokes where possible, tiny deliberate composition, maximum negative space',
    defaultColorMode: 'blackwork',
    traits: ['Tiny', 'Deliberate', 'Quiet'],
    goodFor: ['semicolon', 'stars', 'heart', 'wave', 'mountain', 'family'],
  },
  {
    slug: 'watercolor',
    name: 'Watercolor',
    tagline: 'Paint that never dries.',
    description:
      'Splashes, bleeds and pigment washes that mimic wet paint on paper. Done right, watercolor designs keep a black structural skeleton underneath the colour so they hold their shape as they age — designs without that anchor blur badly, so ours always carry one.',
    promptFragment:
      'watercolor, loose expressive pigment splashes and bleeds, vibrant washes over a subtle black structural skeleton, artistic paint drips',
    defaultColorMode: 'color',
    traits: ['Painterly', 'Vibrant', 'Structured underneath'],
    goodFor: ['hummingbird', 'butterfly', 'lotus', 'phoenix', 'sunflower'],
  },
  {
    slug: 'new-school',
    name: 'New School',
    tagline: 'Cartoons with attitude.',
    description:
      'Exaggerated proportions, graffiti energy, candy-bright colours and cartoon physics. New school peaked in the 90s and is roaring back — it suits characters, animals with personality, and anyone who wants their ink loud. Bold outlines keep it structurally sound for decades.',
    promptFragment:
      'new school, exaggerated cartoon proportions, graffiti-influenced energy, candy-bright saturated palette, bold playful outlines',
    defaultColorMode: 'color',
    traits: ['Cartoon energy', 'Saturated colour', 'Playful'],
    goodFor: ['octopus', 'skull', 'tiger', 'dragon', 'spider'],
  },
  {
    slug: 'chicano',
    name: 'Chicano',
    tagline: 'Smooth grey, deep roots.',
    description:
      'Born in Californian barrios: fine-line black and grey, script lettering, religious iconography, payasas, lowriders and roses. Chicano style carries real cultural history and a distinctive smooth, soft shading language. One of the most requested styles in the world — and one generic AI does worst, which is why our prompt system treats it properly.',
    promptFragment:
      'chicano fine line black and grey, smooth soft airbrushed shading, script lettering elements, religious and barrio iconography, west coast composition',
    defaultColorMode: 'black-and-grey',
    traits: ['Cultural canon', 'Smooth shading', 'Script'],
    goodFor: ['rose', 'clock', 'angel', 'skull', 'memorial', 'cross'],
  },
  {
    slug: 'ignorant',
    name: 'Ignorant',
    tagline: 'Deliberately badly good.',
    description:
      'Anti-style: shaky lines, deadpan stick figures, one-liner jokes in ink. Ignorant style grew from Parisian graffiti and refuses polish on purpose — the charm is the attitude. Simple to execute, painful to fake; the humour has to land.',
    promptFragment:
      'ignorant style, deliberately naive shaky single-weight linework, deadpan crude stick-figure drawing, graffiti doodle attitude, no shading',
    defaultColorMode: 'blackwork',
    traits: ['Anti-polish', 'Humour', 'Graffiti roots'],
    goodFor: ['heart', 'snake', 'skull', 'stars', 'quote'],
  },
  {
    slug: 'sketch',
    name: 'Sketch',
    tagline: 'The artist\'s hand, unfinished on purpose.',
    description:
      'Designs that look lifted straight from a sketchbook: construction lines left visible, hatching, raw pencil energy. Sketch style suits animals and portraits that want motion and looseness instead of polish — the unfinished quality is the finish.',
    promptFragment:
      'sketch style, loose expressive pencil-like linework with visible construction lines and crosshatching, raw sketchbook energy, dynamic unfinished edges',
    defaultColorMode: 'blackwork',
    traits: ['Hatching', 'Loose energy', 'Visible construction'],
    goodFor: ['wolf', 'lion', 'raven', 'bear', 'phoenix'],
  },
  {
    slug: 'illustrative',
    name: 'Illustrative',
    tagline: 'Storybook ink.',
    description:
      'The middle ground between traditional and realism: drawn rather than photographed, with linework carrying the form and shading adding mood. Illustrative is the most flexible style in tattooing — it absorbs botanical, animal, narrative and abstract subjects equally well.',
    promptFragment:
      'illustrative, confident drawn linework carrying the form, expressive etching-inspired shading, storybook illustration quality',
    defaultColorMode: 'blackwork',
    traits: ['Drawn quality', 'Flexible', 'Narrative'],
    goodFor: ['owl', 'moth', 'tree-of-life', 'octopus', 'mushroom', 'raven'],
  },
  {
    slug: 'ornamental',
    name: 'Ornamental',
    tagline: 'Jewellery you can\'t take off.',
    description:
      'Lace, filigree, chandelier drops and henna-inspired pattern work that decorates the body like jewellery. Ornamental designs are architectural — built symmetrically around the body\'s midlines — and pair beautifully with dotwork shading and gem motifs.',
    promptFragment:
      'ornamental, intricate lace and filigree patterns, henna-inspired symmetry, jewellery-like chandelier composition, fine consistent linework',
    defaultColorMode: 'blackwork',
    traits: ['Symmetry', 'Lace & filigree', 'Body jewellery'],
    goodFor: ['mandala', 'lotus', 'moon', 'crown', 'sun-and-moon'],
  },
  {
    slug: 'celtic',
    name: 'Celtic',
    tagline: 'Knots without end.',
    description:
      'Interlaced knotwork, spirals and zoomorphic designs from insular art — patterns with no beginning and no end. Celtic work demands geometric discipline: every strand must weave over-under-over consistently or the knot breaks. Deep heritage for those who carry it.',
    promptFragment:
      'celtic knotwork, precisely interlaced endless knots with consistent over-under weaving, insular art spirals, bold consistent line weight',
    defaultColorMode: 'blackwork',
    traits: ['Knotwork', 'Heritage', 'Endless weave'],
    goodFor: ['cross', 'tree-of-life', 'wolf', 'raven', 'compass'],
  },
  {
    slug: 'biomechanical',
    name: 'Biomechanical',
    tagline: 'The machine under the skin.',
    description:
      'Skin torn open to reveal pistons, cables, chrome and alien anatomy — the H.R. Giger lineage. Biomech is custom-fit by definition: the design must flow with the wearer\'s actual muscle and joint structure, which makes placement-aware composition essential.',
    promptFragment:
      'biomechanical, torn-skin reveal of intricate machinery, pistons cables and chrome fused with organic anatomy, giger-inspired depth and flow',
    defaultColorMode: 'black-and-grey',
    traits: ['Muscle flow', 'Sci-fi', 'Dimensional'],
    goodFor: ['skull', 'spider', 'scorpion', 'dragon'],
  },
  {
    slug: 'trash-polka',
    name: 'Trash Polka',
    tagline: 'Chaos, composed.',
    description:
      'The Buena Vista Tattoo Club signature: realistic imagery collaged with brutal red-and-black graphic elements, smears, typography and geometric chaos. Trash polka is loud, cinematic and unapologetically modern — designed for large canvases like the forearm, thigh or chest.',
    promptFragment:
      'trash polka, realistic imagery collaged with brutal graphic red and black elements, ink smears, bold typography fragments, chaotic composed energy',
    defaultColorMode: 'color',
    traits: ['Red & black', 'Collage', 'Large-scale'],
    goodFor: ['clock', 'skull', 'raven', 'medusa', 'quote'],
  },
  {
    slug: 'script-lettering',
    name: 'Script & Lettering',
    tagline: 'Words that wear well.',
    description:
      'Names, dates, quotes and single words — the most personal tattoos there are. Great lettering is typography first: spacing, flow and letterform quality decide whether a script piece looks custom or clip-art. Our lettering designs are generated as compositions, not fonts.',
    promptFragment:
      'custom tattoo script lettering, elegant hand-drawn calligraphy with balanced spacing and flourishes, typography-first composition',
    defaultColorMode: 'blackwork',
    traits: ['Typography', 'Personal', 'Flow'],
    goodFor: ['quote', 'family', 'memorial', 'semicolon'],
  },
  {
    slug: 'surrealism',
    name: 'Surrealism',
    tagline: 'Dream logic, permanent.',
    description:
      'Melting clocks, impossible anatomy, dreamscapes — imagery that obeys emotion instead of physics. Surrealist tattoos reward big canvases and black-and-grey rendering, where soft transitions sell the dream. The best ones smuggle personal meaning inside the strangeness.',
    promptFragment:
      'surrealism, dreamlike impossible imagery with emotional logic, melting and morphing forms, soft cinematic rendering, dali-inspired composition',
    defaultColorMode: 'black-and-grey',
    traits: ['Dreamlike', 'Conceptual', 'Cinematic'],
    goodFor: ['clock', 'moon', 'octopus', 'medusa', 'eye'],
  },
  {
    slug: 'anime',
    name: 'Anime & Manga',
    tagline: 'Panels in skin.',
    description:
      'Character work, manga panels, screentone shading and cel-style colour. Anime tattoos live or die on likeness and linework cleanliness. Whether it\'s an original character in the style or a composition inspired by a favourite series, the design needs manga\'s graphic grammar, not just "cartoon".',
    promptFragment:
      'anime manga style, clean cel linework, screentone-inspired shading, dynamic panel composition, expressive character energy',
    defaultColorMode: 'blackwork',
    traits: ['Cel linework', 'Screentone', 'Character-first'],
    goodFor: ['dragon', 'koi-fish', 'demon', 'phoenix', 'wolf'],
  },
  {
    slug: 'gothic-blackletter',
    name: 'Gothic & Blackletter',
    tagline: 'Cathedral weight.',
    description:
      'Blackletter typography, gothic architecture, stained-glass framing and medieval iconography. This style trades in weight and reverence — heavy fraktur letterforms, pointed arches, engraved shading. Currently one of the fastest-growing requests in tattooing.',
    promptFragment:
      'gothic blackletter, heavy fraktur letterforms and medieval iconography, cathedral architecture elements, engraved woodcut shading',
    defaultColorMode: 'blackwork',
    traits: ['Blackletter', 'Medieval', 'Heavy'],
    goodFor: ['quote', 'cross', 'grim-reaper', 'angel', 'dagger'],
  },
  {
    slug: 'floral-botanical',
    name: 'Floral & Botanical',
    tagline: 'The garden, engraved.',
    description:
      'Scientific-illustration botanicals: accurate stems, leaves and blooms rendered with etching-style detail. Botanical work differs from generic "flower tattoos" in its accuracy — a peony reads as a peony. It flatters every placement, wraps limbs naturally, and pairs with fine line or dotwork shading.',
    promptFragment:
      'botanical illustration, scientifically accurate flora with etching-style detail, natural stem flow, vintage herbarium quality',
    defaultColorMode: 'blackwork',
    traits: ['Accurate flora', 'Etching detail', 'Limb-wrapping'],
    goodFor: ['peony', 'sunflower', 'cherry-blossom', 'lotus', 'rose', 'mushroom'],
  },
  {
    slug: 'cyber-sigilism',
    name: 'Cyber Sigilism',
    tagline: 'Chrome thorns for the terminally online.',
    description:
      'The 2020s-born style: sharp chrome spikes, tribal-adjacent whips and sci-fi sigils that look engineered rather than drawn. Cyber sigilism suits spines, sternums and shoulders — anywhere its radiating symmetry can stretch. The defining new style of a generation.',
    promptFragment:
      'cyber sigilism, sharp chrome spikes and thorn whips, radiating symmetric sci-fi sigil, engineered futuristic tribal, needle-sharp tapered lines',
    defaultColorMode: 'blackwork',
    traits: ['Chrome spikes', 'Radiating symmetry', 'Gen-Z canon'],
    goodFor: ['spider', 'scorpion', 'stars', 'heart', 'snake'],
  },
  {
    slug: 'patchwork',
    name: 'Patchwork',
    tagline: 'A collection, not a canvas.',
    description:
      'Not one big piece but a curated scatter of smaller, self-contained tattoos with breathing room between them — the patchwork sleeve is the defining look of the 2020s. We design coherent patchwork sets: consistent line weight and shared motifs so the collection reads as intentional.',
    promptFragment:
      'patchwork flash sheet, multiple small self-contained tattoo designs with consistent line weight and shared visual motifs, curated scatter composition',
    defaultColorMode: 'blackwork',
    traits: ['Flash-sheet sets', 'Curated scatter', 'Sleeve strategy'],
    goodFor: ['snake', 'dagger', 'heart', 'stars', 'moth', 'spider'],
  },
];

export function styleBySlug(slug: string): TattooStyle | undefined {
  return STYLES.find((s) => s.slug === slug);
}
