/**
 * Real InkOnce-generated sample designs shipped as static showcase imagery
 * (public/showcase). These are genuine outputs from the generation engine —
 * an image product should show images. Style slugs map to a hero example;
 * a few placements have on-skin previews.
 */
export const STYLE_SHOWCASE: Record<string, string> = {
  'american-traditional': '/showcase/american-traditional.png',
  'neo-traditional': '/showcase/neo-traditional.png',
  'fine-line': '/showcase/fine-line.png',
  blackwork: '/showcase/blackwork.png',
  realism: '/showcase/realism.png',
  'black-and-grey': '/showcase/black-and-grey.png',
  'japanese-irezumi': '/showcase/japanese-irezumi.png',
  tribal: '/showcase/tribal.png',
  geometric: '/showcase/geometric.png',
  dotwork: '/showcase/dotwork.png',
  minimalist: '/showcase/minimalist.png',
  watercolor: '/showcase/watercolor.png',
  'new-school': '/showcase/new-school.png',
  chicano: '/showcase/chicano.png',
  ignorant: '/showcase/ignorant.png',
  sketch: '/showcase/sketch.png',
  illustrative: '/showcase/illustrative.png',
  ornamental: '/showcase/ornamental.png',
  celtic: '/showcase/celtic.png',
  biomechanical: '/showcase/biomechanical.png',
  'trash-polka': '/showcase/trash-polka.png',
  'script-lettering': '/showcase/script-lettering.png',
  surrealism: '/showcase/surrealism.png',
  anime: '/showcase/anime.png',
  'gothic-blackletter': '/showcase/gothic-blackletter.png',
  'floral-botanical': '/showcase/floral-botanical.png',
  'cyber-sigilism': '/showcase/cyber-sigilism.png',
  patchwork: '/showcase/patchwork.png',
};

export const PLACEMENT_SHOWCASE: Record<string, string> = {
  forearm: '/showcase/place-forearm.png',
  'upper-arm': '/showcase/place-upper-arm.png',
  sleeve: '/showcase/place-sleeve.png',
  'half-sleeve': '/showcase/place-half-sleeve.png',
  wrist: '/showcase/place-wrist.png',
  hand: '/showcase/place-hand.png',
  finger: '/showcase/place-finger.png',
  shoulder: '/showcase/place-shoulder.png',
  chest: '/showcase/place-chest.png',
  back: '/showcase/place-back.png',
  spine: '/showcase/place-spine.png',
  ribs: '/showcase/place-ribs.png',
  hip: '/showcase/place-hip.png',
  thigh: '/showcase/place-thigh.png',
  calf: '/showcase/place-calf.png',
  ankle: '/showcase/place-ankle.png',
  foot: '/showcase/place-foot.png',
  neck: '/showcase/place-neck.png',
  'behind-ear': '/showcase/place-behind-ear.png',
  sternum: '/showcase/place-sternum.png',
};

/** Ordered gallery for the homepage hero strip. */
export const GALLERY: { src: string; label: string; href: string }[] = [
  { src: '/showcase/fine-line.png', label: 'Fine Line', href: '/styles/fine-line' },
  { src: '/showcase/blackwork.png', label: 'Blackwork', href: '/styles/blackwork' },
  { src: '/showcase/japanese-irezumi.png', label: 'Japanese', href: '/styles/japanese-irezumi' },
  { src: '/showcase/american-traditional.png', label: 'Traditional', href: '/styles/american-traditional' },
  { src: '/showcase/chicano.png', label: 'Chicano', href: '/styles/chicano' },
  { src: '/showcase/geometric.png', label: 'Geometric', href: '/styles/geometric' },
];

/** Full-colour gallery — proves the engine does vivid colour, not just linework. */
export const COLOUR_GALLERY: { src: string; label: string; href: string }[] = [
  { src: '/showcase/colour-japanese-sleeve.png', label: 'Colour Japanese sleeve', href: '/styles/japanese-irezumi' },
  { src: '/showcase/colour-realism-tiger.png', label: 'Colour realism', href: '/styles/realism' },
  { src: '/showcase/colour-watercolor-phoenix.png', label: 'Watercolour', href: '/styles/watercolor' },
  { src: '/showcase/colour-neotrad-fox.png', label: 'Neo-traditional', href: '/styles/neo-traditional' },
  { src: '/showcase/colour-floral-sleeve.png', label: 'Colour floral sleeve', href: '/styles/floral-botanical' },
  { src: '/showcase/colour-newschool-sleeve.png', label: 'New school sleeve', href: '/styles/new-school' },
];

export function styleImage(slug: string): string | undefined {
  return STYLE_SHOWCASE[slug];
}
export function placementImage(slug: string): string | undefined {
  return PLACEMENT_SHOWCASE[slug];
}
