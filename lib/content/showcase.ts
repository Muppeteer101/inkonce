/**
 * Real InkOnce-generated sample designs shipped as static showcase imagery
 * (public/showcase). These are genuine outputs from the generation engine —
 * an image product should show images. Style slugs map to a hero example;
 * a few placements have on-skin previews.
 */
export const STYLE_SHOWCASE: Record<string, string> = {
  'american-traditional': '/showcase/american-traditional.png',
  'fine-line': '/showcase/fine-line.png',
  'japanese-irezumi': '/showcase/japanese-irezumi.png',
  blackwork: '/showcase/blackwork.png',
  chicano: '/showcase/chicano.png',
  geometric: '/showcase/geometric.png',
};

export const PLACEMENT_SHOWCASE: Record<string, string> = {
  forearm: '/showcase/place-forearm.png',
  'upper-arm': '/showcase/place-upper-arm.png',
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

export function styleImage(slug: string): string | undefined {
  return STYLE_SHOWCASE[slug];
}
export function placementImage(slug: string): string | undefined {
  return PLACEMENT_SHOWCASE[slug];
}
