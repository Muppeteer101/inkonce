/**
 * Tattoo idea library — every subject someone actually searches for, with
 * meanings (the #1 thing people research before committing) and curated
 * style/placement pairings. Powers /ideas/{slug} and /ideas/{slug}/{style}.
 */

export type TattooIdea = {
  slug: string;
  name: string;
  description: string;
  meanings: string[];
  bestStyles: string[]; // style slugs
  bestPlacements: string[]; // placement slugs
};

export const IDEAS: TattooIdea[] = [
  {
    slug: 'lion',
    name: 'Lion',
    description:
      'The king of tattoo subjects: courage, leadership and self-mastery rendered in mane and stare. Works from tiny fine-line profiles to full realism chest pieces.',
    meanings: ['Courage', 'Leadership', 'Family protection', 'Leo zodiac'],
    bestStyles: ['realism', 'neo-traditional', 'geometric', 'sketch'],
    bestPlacements: ['forearm', 'chest', 'thigh'],
  },
  {
    slug: 'wolf',
    name: 'Wolf',
    description:
      'Loyalty and wildness in one animal — the lone hunter and the pack guardian. A wolf\'s expression carries the whole design, so linework quality matters enormously.',
    meanings: ['Loyalty', 'Instinct', 'Family / the pack', 'Independence'],
    bestStyles: ['realism', 'geometric', 'sketch', 'neo-traditional'],
    bestPlacements: ['forearm', 'upper-arm', 'back'],
  },
  {
    slug: 'snake',
    name: 'Snake',
    description:
      'Rebirth, danger and elegance — the most compositionally flexible subject in tattooing, coiling around arms, wrists and spines like it was designed for skin.',
    meanings: ['Rebirth & transformation', 'Protection', 'Temptation', 'Healing (Asclepius)'],
    bestStyles: ['american-traditional', 'japanese-irezumi', 'blackwork', 'fine-line'],
    bestPlacements: ['forearm', 'spine', 'hip'],
  },
  {
    slug: 'dragon',
    name: 'Dragon',
    description:
      'East or West, the dragon is power incarnate. Japanese dragons flow with the body over full sleeves; Western dragons bring medieval menace to backs and chests.',
    meanings: ['Power & wisdom', 'Protection', 'Good fortune (East)', 'Fierce independence'],
    bestStyles: ['japanese-irezumi', 'anime', 'blackwork', 'new-school'],
    bestPlacements: ['sleeve', 'back', 'ribs'],
  },
  {
    slug: 'phoenix',
    name: 'Phoenix',
    description:
      'The firebird that burns and returns — the definitive comeback tattoo. Its sweeping tail feathers reward placements with vertical room to rise.',
    meanings: ['Rebirth from hardship', 'Resilience', 'New chapter', 'Immortality'],
    bestStyles: ['japanese-irezumi', 'watercolor', 'neo-traditional', 'sketch'],
    bestPlacements: ['back', 'ribs', 'thigh'],
  },
  {
    slug: 'butterfly',
    name: 'Butterfly',
    description:
      'Transformation made visible. From single fine-line pieces to symmetrical blackwork, the butterfly is one of the most-searched tattoo subjects on earth, and earns it.',
    meanings: ['Transformation', 'Freedom', 'Femininity', 'Remembrance'],
    bestStyles: ['fine-line', 'watercolor', 'blackwork', 'cyber-sigilism'],
    bestPlacements: ['shoulder', 'sternum', 'behind-ear'],
  },
  {
    slug: 'rose',
    name: 'Rose',
    description:
      'The most tattooed flower in history: love with thorns. A rose anchors traditional pieces, softens skulls and clocks, and stands alone at any size.',
    meanings: ['Love', 'Beauty with defence', 'Balance of joy and pain', 'Devotion'],
    bestStyles: ['american-traditional', 'black-and-grey', 'fine-line', 'chicano'],
    bestPlacements: ['forearm', 'hand', 'shoulder'],
  },
  {
    slug: 'skull',
    name: 'Skull',
    description:
      'Memento mori — remember you will die, so live. The skull is tattooing\'s oldest philosophical statement, from sailor flash to hyperreal black and grey.',
    meanings: ['Mortality accepted', 'Rebellion', 'Protection', 'Living fully'],
    bestStyles: ['black-and-grey', 'american-traditional', 'chicano', 'biomechanical'],
    bestPlacements: ['upper-arm', 'chest', 'calf'],
  },
  {
    slug: 'owl',
    name: 'Owl',
    description:
      'Wisdom that hunts at night. The owl\'s face is a natural mandala — symmetric, hypnotic, and spectacular in neo-traditional and dotwork treatments.',
    meanings: ['Wisdom', 'Seeing through darkness', 'Guardianship', 'Mystery'],
    bestStyles: ['neo-traditional', 'dotwork', 'illustrative', 'realism'],
    bestPlacements: ['chest', 'forearm', 'thigh'],
  },
  {
    slug: 'koi-fish',
    name: 'Koi Fish',
    description:
      'The carp that swims upstream and becomes a dragon. Direction matters in the tradition: upstream for struggle in progress, downstream for battles already won.',
    meanings: ['Perseverance', 'Ambition', 'Good fortune', 'Transformation'],
    bestStyles: ['japanese-irezumi', 'watercolor', 'anime', 'illustrative'],
    bestPlacements: ['sleeve', 'ribs', 'thigh'],
  },
  {
    slug: 'tiger',
    name: 'Tiger',
    description:
      'Raw power with perfect stripes. The tiger dominates Japanese and realism traditions alike — its face demands technical excellence and rewards it doubly.',
    meanings: ['Strength', 'Courage against evil', 'Passion', 'Independence'],
    bestStyles: ['japanese-irezumi', 'realism', 'new-school', 'neo-traditional'],
    bestPlacements: ['upper-arm', 'back', 'thigh'],
  },
  {
    slug: 'eagle',
    name: 'Eagle',
    description:
      'Spread wings across a chest or a screaming head on a bicep — the eagle is American Traditional\'s crown jewel and realism\'s favourite raptor.',
    meanings: ['Freedom', 'Vision & focus', 'Patriotism', 'Rising above'],
    bestStyles: ['american-traditional', 'realism', 'blackwork', 'sketch'],
    bestPlacements: ['chest', 'upper-arm', 'back'],
  },
  {
    slug: 'bear',
    name: 'Bear',
    description:
      'Quiet strength that should not be tested. Geometric bears made the style famous; realistic bears carry wilderness gravitas on forearms and calves.',
    meanings: ['Strength', 'Protection of family', 'Solitude', 'Connection to nature'],
    bestStyles: ['geometric', 'realism', 'sketch', 'blackwork'],
    bestPlacements: ['forearm', 'calf', 'chest'],
  },
  {
    slug: 'octopus',
    name: 'Octopus',
    description:
      'Eight arms of compositional freedom — the octopus wraps shoulders, climbs ribs and coils down forearms like no other subject. Intelligence and adaptability in ink.',
    meanings: ['Intelligence', 'Adaptability', 'Mystery of the deep', 'Flexibility'],
    bestStyles: ['blackwork', 'japanese-irezumi', 'new-school', 'illustrative'],
    bestPlacements: ['shoulder', 'ribs', 'thigh'],
  },
  {
    slug: 'spider',
    name: 'Spider',
    description:
      'Patience, craft and a little menace. From traditional webs on elbows to hyperreal jumping spiders, the spider rewards both bold and delicate treatments.',
    meanings: ['Patience', 'Creativity (the weaver)', 'Fear conquered', 'Fate\'s web'],
    bestStyles: ['american-traditional', 'blackwork', 'realism', 'cyber-sigilism'],
    bestPlacements: ['hand', 'neck', 'shoulder'],
  },
  {
    slug: 'scorpion',
    name: 'Scorpion',
    description:
      'Armoured, precise and permanently ready. The scorpion\'s segmented body suits geometric and tribal abstraction as naturally as realism.',
    meanings: ['Defence', 'Scorpio zodiac', 'Danger respected', 'Survival'],
    bestStyles: ['tribal', 'blackwork', 'realism', 'cyber-sigilism'],
    bestPlacements: ['hand', 'shoulder', 'calf'],
  },
  {
    slug: 'hummingbird',
    name: 'Hummingbird',
    description:
      'Joy at 50 wingbeats per second. The hummingbird is watercolor\'s signature subject — motion, colour and lightness in a small, placement-friendly package.',
    meanings: ['Joy', 'Lightness of being', 'Resilience', 'Enjoying the moment'],
    bestStyles: ['watercolor', 'fine-line', 'realism', 'neo-traditional'],
    bestPlacements: ['shoulder', 'wrist', 'ribs'],
  },
  {
    slug: 'raven',
    name: 'Raven',
    description:
      'Poe\'s bird: intelligence dressed in black. Ravens do their best work in blackwork and sketch styles, where feather texture becomes the whole show.',
    meanings: ['Intelligence', 'Prophecy', 'Transformation', 'Memory (Huginn & Muninn)'],
    bestStyles: ['blackwork', 'sketch', 'illustrative', 'trash-polka'],
    bestPlacements: ['shoulder', 'forearm', 'chest'],
  },
  {
    slug: 'moth',
    name: 'Moth',
    description:
      'The butterfly\'s nocturnal twin — drawn to light it cannot have. The death\'s-head moth in particular is a modern classic, symmetric and sternum-perfect.',
    meanings: ['Pursuit of light', 'Transformation', 'Vulnerability', 'Fate'],
    bestStyles: ['dotwork', 'blackwork', 'neo-traditional', 'fine-line'],
    bestPlacements: ['sternum', 'chest', 'thigh'],
  },
  {
    slug: 'mandala',
    name: 'Mandala',
    description:
      'Sacred circle, drawn from centre outward. Mandalas demand geometric precision and reward dotwork shading — meditation you can wear.',
    meanings: ['Wholeness', 'Balance', 'The universe in miniature', 'Meditation'],
    bestStyles: ['dotwork', 'geometric', 'ornamental', 'fine-line'],
    bestPlacements: ['shoulder', 'sternum', 'back'],
  },
  {
    slug: 'compass',
    name: 'Compass',
    description:
      'For those who navigate by their own north. Compasses pair beautifully with maps, coordinates and clocks — the traveller\'s core iconography.',
    meanings: ['Direction & purpose', 'Travel', 'Coming home', 'Independence'],
    bestStyles: ['geometric', 'american-traditional', 'fine-line', 'celtic'],
    bestPlacements: ['forearm', 'chest', 'calf'],
  },
  {
    slug: 'anchor',
    name: 'Anchor',
    description:
      'The original sailor tattoo: stability whatever the storm. Traditional anchors with rope and banner remain flash-sheet royalty a century on.',
    meanings: ['Stability', 'Loyalty', 'Safe harbour', 'Naval heritage'],
    bestStyles: ['american-traditional', 'minimalist', 'fine-line', 'blackwork'],
    bestPlacements: ['forearm', 'ankle', 'wrist'],
  },
  {
    slug: 'clock',
    name: 'Clock',
    description:
      'Time made personal — usually set to a moment that mattered: a birth, a loss, a turning point. Clocks anchor black-and-grey realism\'s most emotional pieces.',
    meanings: ['A moment preserved', 'Mortality', 'Patience', 'Family history'],
    bestStyles: ['black-and-grey', 'realism', 'chicano', 'trash-polka'],
    bestPlacements: ['forearm', 'upper-arm', 'chest'],
  },
  {
    slug: 'dagger',
    name: 'Dagger',
    description:
      'Courage, betrayal survived, or protection — the dagger cuts through flash history. Through a heart, a rose or a skull, it turns any motif into a story.',
    meanings: ['Courage', 'Betrayal survived', 'Protection', 'Sacrifice'],
    bestStyles: ['american-traditional', 'blackwork', 'gothic-blackletter', 'fine-line'],
    bestPlacements: ['forearm', 'calf', 'thigh'],
  },
  {
    slug: 'crown',
    name: 'Crown',
    description:
      'Self-sovereignty in a small package. Crowns work solo at tiny scale or top monograms, lions and hearts as the finishing statement.',
    meanings: ['Self-worth', 'Power over one\'s life', 'Loyalty (with a partner\'s)', 'Achievement'],
    bestStyles: ['minimalist', 'fine-line', 'ornamental', 'chicano'],
    bestPlacements: ['wrist', 'behind-ear', 'finger'],
  },
  {
    slug: 'heart',
    name: 'Heart',
    description:
      'From the sailor\'s "MOM" banner to a single minimalist line, the heart is tattooing\'s most enduring symbol — endlessly personal, endlessly reinvented.',
    meanings: ['Love', 'Devotion', 'Loss', 'Passion'],
    bestStyles: ['american-traditional', 'minimalist', 'ignorant', 'fine-line'],
    bestPlacements: ['wrist', 'upper-arm', 'ankle'],
  },
  {
    slug: 'angel',
    name: 'Angel',
    description:
      'Guardianship, faith and remembrance. Angel pieces span cherubs, warrior archangels and abstract wings — black and grey\'s most requested spiritual subject.',
    meanings: ['Protection', 'Faith', 'Remembrance', 'Guidance'],
    bestStyles: ['black-and-grey', 'realism', 'chicano', 'gothic-blackletter'],
    bestPlacements: ['back', 'chest', 'upper-arm'],
  },
  {
    slug: 'demon',
    name: 'Demon / Oni',
    description:
      'The shadow acknowledged. Japanese oni masks ward off evil by wearing its face; Western demons explore darkness on the wearer\'s own terms.',
    meanings: ['Protection through fear', 'Inner shadow', 'Rebellion', 'Duality'],
    bestStyles: ['japanese-irezumi', 'anime', 'blackwork', 'new-school'],
    bestPlacements: ['calf', 'thigh', 'upper-arm'],
  },
  {
    slug: 'grim-reaper',
    name: 'Grim Reaper',
    description:
      'Death as a companion rather than an enemy. The reaper is blackwork\'s natural subject — all cloak, scythe and silhouette.',
    meanings: ['Mortality faced', 'Fearlessness', 'Endings and beginnings', 'Protection'],
    bestStyles: ['blackwork', 'gothic-blackletter', 'american-traditional', 'sketch'],
    bestPlacements: ['calf', 'thigh', 'back'],
  },
  {
    slug: 'medusa',
    name: 'Medusa',
    description:
      'Reclaimed in recent years as a survivor\'s symbol: the woman punished for another\'s crime, turned monster, turned icon. Powerful in black and grey and blackwork.',
    meanings: ['Survival', 'Reclaimed power', 'Protection from evil', 'Female rage'],
    bestStyles: ['black-and-grey', 'blackwork', 'fine-line', 'surrealism'],
    bestPlacements: ['thigh', 'upper-arm', 'ribs'],
  },
  {
    slug: 'sun-and-moon',
    name: 'Sun & Moon',
    description:
      'Opposites in orbit: day and night, logic and intuition, two people in one design. A favourite for matching tattoos and fine-line minimalism.',
    meanings: ['Balance of opposites', 'Duality', 'Partnership', 'Cycles'],
    bestStyles: ['fine-line', 'dotwork', 'tribal', 'ornamental'],
    bestPlacements: ['wrist', 'ankle', 'spine'],
  },
  {
    slug: 'moon',
    name: 'Moon',
    description:
      'Phases, crescents and full-face moons — the night\'s timekeeper. Moon phases running down the spine are a modern classic.',
    meanings: ['Cycles & change', 'Femininity', 'Intuition', 'Growth through phases'],
    bestStyles: ['fine-line', 'dotwork', 'ornamental', 'surrealism'],
    bestPlacements: ['spine', 'wrist', 'behind-ear'],
  },
  {
    slug: 'stars',
    name: 'Stars',
    description:
      'From nautical stars that guided sailors home to scattered fine-line constellations, stars remain tattooing\'s most flexible small motif.',
    meanings: ['Guidance', 'Hope', 'A person remembered', 'Ambition'],
    bestStyles: ['fine-line', 'minimalist', 'american-traditional', 'cyber-sigilism'],
    bestPlacements: ['wrist', 'behind-ear', 'ankle'],
  },
  {
    slug: 'eye',
    name: 'Eye',
    description:
      'The all-seeing eye, the evil eye, a loved one\'s eye in realism — few motifs carry as much symbolic voltage per square centimetre.',
    meanings: ['Protection (evil eye)', 'Awareness', 'Truth', 'A watchful loved one'],
    bestStyles: ['realism', 'surrealism', 'dotwork', 'trash-polka'],
    bestPlacements: ['hand', 'forearm', 'sternum'],
  },
  {
    slug: 'mountain',
    name: 'Mountain',
    description:
      'The climb that made you. Mountain ranges suit minimalist line treatments and dramatic blackwork silhouettes alike — often paired with pines, moons and coordinates.',
    meanings: ['Overcoming', 'Perspective', 'Home landscape', 'Steadiness'],
    bestStyles: ['minimalist', 'blackwork', 'geometric', 'fine-line'],
    bestPlacements: ['forearm', 'upper-arm', 'ankle'],
  },
  {
    slug: 'wave',
    name: 'Wave',
    description:
      'Hokusai\'s legacy in miniature: the ocean\'s power in a curl of ink. Waves flow naturally around wrists and ankles and anchor Japanese compositions.',
    meanings: ['Nature\'s power', 'Going with the flow', 'The ocean as home', 'Constancy in change'],
    bestStyles: ['japanese-irezumi', 'minimalist', 'blackwork', 'fine-line'],
    bestPlacements: ['wrist', 'ankle', 'forearm'],
  },
  {
    slug: 'tree-of-life',
    name: 'Tree of Life',
    description:
      'Roots and branches as one system — ancestry, growth and connection across nearly every culture\'s mythology. Circular framings suit shoulders and backs beautifully.',
    meanings: ['Family & ancestry', 'Growth', 'Connection of all things', 'Strength from roots'],
    bestStyles: ['celtic', 'dotwork', 'geometric', 'illustrative'],
    bestPlacements: ['back', 'shoulder', 'thigh'],
  },
  {
    slug: 'lotus',
    name: 'Lotus',
    description:
      'The flower that grows from mud into perfection — enlightenment\'s favourite metaphor. The lotus\'s symmetry suits sternum, spine and ornamental treatments.',
    meanings: ['Rising from difficulty', 'Purity', 'Enlightenment', 'New beginnings'],
    bestStyles: ['dotwork', 'fine-line', 'ornamental', 'watercolor'],
    bestPlacements: ['sternum', 'spine', 'ankle'],
  },
  {
    slug: 'cherry-blossom',
    name: 'Cherry Blossom',
    description:
      'Sakura: beauty precisely because it doesn\'t last. Branches drift across collarbones and ribs; single blossoms scatter through Japanese sleeves.',
    meanings: ['Life\'s brevity', 'Beauty in impermanence', 'Renewal', 'Gentleness'],
    bestStyles: ['japanese-irezumi', 'fine-line', 'watercolor', 'floral-botanical'],
    bestPlacements: ['ribs', 'shoulder', 'forearm'],
  },
  {
    slug: 'peony',
    name: 'Peony',
    description:
      'The king of flowers in Japanese tattooing — layered, luxurious and traditionally paired with lions and dragons to balance power with beauty.',
    meanings: ['Prosperity', 'Honour', 'Beauty with backbone', 'Good fortune'],
    bestStyles: ['japanese-irezumi', 'neo-traditional', 'floral-botanical', 'black-and-grey'],
    bestPlacements: ['shoulder', 'thigh', 'ribs'],
  },
  {
    slug: 'sunflower',
    name: 'Sunflower',
    description:
      'The flower that turns to face the light. Sunflowers carry warmth, loyalty and remembrance — glorious in botanical linework and watercolor.',
    meanings: ['Optimism', 'Loyalty', 'A bright person remembered', 'Growth toward light'],
    bestStyles: ['floral-botanical', 'watercolor', 'fine-line', 'american-traditional'],
    bestPlacements: ['shoulder', 'forearm', 'ankle'],
  },
  {
    slug: 'mushroom',
    name: 'Mushroom',
    description:
      'Cottagecore\'s favourite fungus: whimsical fly agarics, botanical morels and psychedelic nods. Mushrooms bring storybook charm to fine-line and illustrative work.',
    meanings: ['Whimsy', 'Connection to nature', 'Transformation', 'Resilience in dark places'],
    bestStyles: ['illustrative', 'fine-line', 'floral-botanical', 'new-school'],
    bestPlacements: ['ankle', 'forearm', 'calf'],
  },
  {
    slug: 'shark',
    name: 'Shark',
    description:
      'The ocean\'s apex predator — traditional Polynesian shark teeth patterns carry protection, while realistic and traditional sharks carry pure momentum.',
    meanings: ['Protection (Polynesian)', 'Fearlessness', 'Forward motion', 'Adaptation'],
    bestStyles: ['tribal', 'american-traditional', 'realism', 'blackwork'],
    bestPlacements: ['calf', 'upper-arm', 'ribs'],
  },
  {
    slug: 'turtle',
    name: 'Sea Turtle',
    description:
      'The Polynesian honu: navigator, ancestor, bringer of good fortune. Turtle shells carry pattern work beautifully in tribal and geometric styles.',
    meanings: ['Longevity', 'Guidance home', 'Peace', 'Family (Polynesian honu)'],
    bestStyles: ['tribal', 'geometric', 'watercolor', 'minimalist'],
    bestPlacements: ['shoulder', 'calf', 'foot'],
  },
  {
    slug: 'cross',
    name: 'Cross',
    description:
      'Faith rendered in a thousand ways: Celtic knots, gothic cathedals, minimalist lines, rosary-wrapped chicano pieces. The most personal religious motif in ink.',
    meanings: ['Faith', 'Sacrifice', 'Remembrance', 'Heritage'],
    bestStyles: ['celtic', 'chicano', 'gothic-blackletter', 'minimalist'],
    bestPlacements: ['forearm', 'chest', 'upper-arm'],
  },
  {
    slug: 'semicolon',
    name: 'Semicolon',
    description:
      'The sentence could have ended; it didn\'t. The semicolon is the mental-health community\'s quiet emblem of continuing — small, powerful, and often a first tattoo.',
    meanings: ['A story that continues', 'Mental-health survival', 'Solidarity', 'Hope'],
    bestStyles: ['minimalist', 'fine-line', 'script-lettering', 'ignorant'],
    bestPlacements: ['wrist', 'behind-ear', 'finger'],
  },
  {
    slug: 'family',
    name: 'Family',
    description:
      'Names, birth flowers, coordinates, matching symbols — family pieces are tattooing\'s most commissioned category. The best ones encode the bond rather than just labelling it.',
    meanings: ['Bond & belonging', 'Parenthood', 'Roots', 'Protection'],
    bestStyles: ['script-lettering', 'fine-line', 'minimalist', 'chicano'],
    bestPlacements: ['forearm', 'chest', 'wrist'],
  },
  {
    slug: 'memorial',
    name: 'Memorial',
    description:
      'Ink as remembrance: dates, portraits, birth flowers, a handwriting sample, a bird taking flight. Memorial tattoos turn grief into something carried with intention.',
    meanings: ['Remembrance', 'Continuing bond', 'Celebration of a life', 'Grief given form'],
    bestStyles: ['black-and-grey', 'script-lettering', 'realism', 'fine-line'],
    bestPlacements: ['forearm', 'chest', 'ribs'],
  },
  {
    slug: 'quote',
    name: 'Quote & Script',
    description:
      'Words you need within reach: a lyric, a parent\'s handwriting, a line that got you through. Typography quality decides everything — spacing, flow and letterform.',
    meanings: ['A guiding principle', 'A voice remembered', 'Identity', 'Commitment'],
    bestStyles: ['script-lettering', 'gothic-blackletter', 'fine-line', 'minimalist'],
    bestPlacements: ['forearm', 'ribs', 'spine'],
  },
];

export function ideaBySlug(slug: string): TattooIdea | undefined {
  return IDEAS.find((i) => i.slug === slug);
}
