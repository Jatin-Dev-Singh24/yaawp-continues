// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
export interface EmojiBlend {
  id: string;
  emoji1: string;
  emoji2: string;
  name: string;
  description: string;
  assetUrl: string;
  tags: string[];
}

// Canonical key generator ensuring emoji order doesn't matter (e.g. '🐱+❤️' === '❤️+🐱')
export function getBlendPairKey(e1: string, e2: string): string {
  const norm1 = e1.trim();
  const norm2 = e2.trim();
  return [norm1, norm2].sort().join('+');
}

export const ALL_EMOJI_BLENDS: EmojiBlend[] = [
  {
    id: 'cat_heart',
    emoji1: '🐱',
    emoji2: '❤️',
    name: 'Cat in Love',
    description: 'A blushing, joyful kitten with sparkling red heart-shaped eyes.',
    assetUrl: '/emoji-kitchen/cat_heart.webp',
    tags: ['cat', 'heart', 'love', 'cute', 'kitten', 'romantic']
  },
  {
    id: 'heart_fire',
    emoji1: '🔥',
    emoji2: '❤️',
    name: 'Heart on Fire',
    description: 'A passionate crimson heart blazing with golden-orange flames.',
    assetUrl: '/emoji-kitchen/heart_fire.webp',
    tags: ['fire', 'heart', 'flame', 'passion', 'hot', 'lit']
  },
  {
    id: 'skull_crying',
    emoji1: '💀',
    emoji2: '😭',
    name: 'Dying of Laughter',
    description: 'A dramatic skull weeping waterfalls of laughter tears.',
    assetUrl: '/emoji-kitchen/skull_crying.webp',
    tags: ['skull', 'crying', 'dead', 'lol', 'lmao', 'laughter', 'tears']
  },
  {
    id: 'cowboy_dog',
    emoji1: '🤠',
    emoji2: '🐶',
    name: 'Sheriff Pup',
    description: 'A happy golden retriever sporting a weathered brown leather cowboy hat.',
    assetUrl: '/emoji-kitchen/cowboy_dog.webp',
    tags: ['cowboy', 'dog', 'puppy', 'sheriff', 'western', 'howdy']
  },
  {
    id: 'robot_heart',
    emoji1: '🤖',
    emoji2: '❤️',
    name: 'Lovestruck Bot',
    description: 'A retro metallic robot beaming with heart monitor radar eyes.',
    assetUrl: '/emoji-kitchen/robot_heart.webp',
    tags: ['robot', 'bot', 'heart', 'tech', 'ai', 'love']
  },
  {
    id: 'ghost_coffee',
    emoji1: '👻',
    emoji2: '☕',
    name: 'Spooky Brew',
    description: 'A cozy floating ghost sipping a hot ceramic cup of steaming coffee.',
    assetUrl: '/emoji-kitchen/ghost_coffee.webp',
    tags: ['ghost', 'coffee', 'spooky', 'brew', 'halloween', 'cafe', 'morning']
  },
  {
    id: 'avocado_cat',
    emoji1: '🥑',
    emoji2: '🐱',
    name: 'Avocado Kitty',
    description: 'A ripe Haas avocado half with a curled-up sleeping cat as the pit.',
    assetUrl: '/emoji-kitchen/avocado_cat.webp',
    tags: ['avocado', 'cat', 'guacamole', 'fruit', 'cute', 'kitty', 'sleepy']
  },
  {
    id: 'pizza_rocket',
    emoji1: '🍕',
    emoji2: '🚀',
    name: 'Pizza Rocket',
    description: 'A loaded pepperoni slice equipped with supersonic thruster jets.',
    assetUrl: '/emoji-kitchen/pizza_rocket.webp',
    tags: ['pizza', 'rocket', 'food', 'space', 'snack', 'fast', 'blast']
  },
  {
    id: 'clown_balloon',
    emoji1: '🤡',
    emoji2: '🎈',
    name: 'Carnival Balloon',
    description: 'A bright crimson helium balloon painted with a cheerful circus clown face.',
    assetUrl: '/emoji-kitchen/clown_balloon.webp',
    tags: ['clown', 'balloon', 'carnival', 'circus', 'party', 'funny']
  },
  {
    id: 'sparkle_unicorn',
    emoji1: '🦄',
    emoji2: '✨',
    name: 'Astral Unicorn',
    description: 'A magical pure white unicorn crowned with astral golden stars.',
    assetUrl: '/emoji-kitchen/sparkle_unicorn.webp',
    tags: ['unicorn', 'sparkle', 'magic', 'stars', 'galaxy', 'rainbow', 'fantasy']
  },
  {
    id: 'frog_tea',
    emoji1: '🐸',
    emoji2: '☕',
    name: 'Tea Sipper',
    description: 'A serene green tree frog calmly minding his business while sipping tea.',
    assetUrl: '/emoji-kitchen/frog_tea.webp',
    tags: ['frog', 'tea', 'coffee', 'meme', 'chill', 'calm', 'kermit']
  },
  {
    id: 'party_cake',
    emoji1: '🥳',
    emoji2: '🎂',
    name: 'Party Cake',
    description: 'An ecstatic party face balancing a birthday cake with lit candles.',
    assetUrl: '/emoji-kitchen/party_cake.webp',
    tags: ['party', 'cake', 'birthday', 'celebration', 'fun', 'happy']
  },
  {
    id: 'panda_bamboo',
    emoji1: '🐼',
    emoji2: '🎋',
    name: 'Zen Panda',
    description: 'A chubby peaceful panda happily munching on fresh green bamboo.',
    assetUrl: '/emoji-kitchen/panda_bamboo.webp',
    tags: ['panda', 'bamboo', 'bear', 'zen', 'green', 'nature']
  },
  {
    id: 'monkey_banana',
    emoji1: '🐵',
    emoji2: '🍌',
    name: 'Banana Chimp',
    description: 'A playful monkey crowned with a golden tropical banana peel.',
    assetUrl: '/emoji-kitchen/monkey_banana.webp',
    tags: ['monkey', 'banana', 'chimp', 'fruit', 'jungle', 'silly']
  },
  {
    id: 'strawberry_icecream',
    emoji1: '🍦',
    emoji2: '🍓',
    name: 'Berry Swirl Sundae',
    description: 'A crispy waffle cone packed with strawberry soft-serve and rainbow sprinkles.',
    assetUrl: '/emoji-kitchen/strawberry_icecream.webp',
    tags: ['ice cream', 'strawberry', 'dessert', 'sweet', 'summer', 'treat']
  },
  {
    id: 'alien_saucer',
    emoji1: '👽',
    emoji2: '🛸',
    name: 'Cosmic Pilot',
    description: 'A friendly alien piloting a neon-illuminated flying saucer.',
    assetUrl: '/emoji-kitchen/alien_saucer.webp',
    tags: ['alien', 'ufo', 'flying saucer', 'space', 'sci-fi', 'futuristic']
  },
  {
    id: 'lion_king',
    emoji1: '🦁',
    emoji2: '👑',
    name: 'Royal Lion',
    description: 'A majestic golden lion cub wearing an ornate jeweled royal crown.',
    assetUrl: '/emoji-kitchen/lion_king.webp',
    tags: ['lion', 'crown', 'king', 'royal', 'queen', 'majestic']
  },
  {
    id: 'koala_leaf',
    emoji1: '🐨',
    emoji2: '🌿',
    name: 'Cozy Koala',
    description: 'A fuzzy grey koala lovingly hugging sweet eucalyptus branches.',
    assetUrl: '/emoji-kitchen/koala_leaf.webp',
    tags: ['koala', 'leaf', 'herb', 'nature', 'cute', 'australia']
  },
  {
    id: 'rainbow_cloud',
    emoji1: '🌈',
    emoji2: '🌧️',
    name: 'Sunshower Cloud',
    description: 'A smiling fluffy cloud with vivid rainbow rainfall.',
    assetUrl: '/emoji-kitchen/rainbow_cloud.webp',
    tags: ['rainbow', 'rain', 'cloud', 'weather', 'happy', 'nature']
  },
  {
    id: 'pumpkin_ghost',
    emoji1: '🎃',
    emoji2: '👻',
    name: 'Jack-o-Ghost',
    description: 'A carved glowing Halloween pumpkin with a friendly ghost popping out.',
    assetUrl: '/emoji-kitchen/pumpkin_ghost.webp',
    tags: ['pumpkin', 'ghost', 'halloween', 'spooky', 'autumn', 'fall']
  },
  {
    id: 'teddy_heart',
    emoji1: '🧸',
    emoji2: '💖',
    name: 'Cuddle Bear',
    description: 'A plush teddy bear hugging a glittering pink crystal heart.',
    assetUrl: '/emoji-kitchen/teddy_heart.webp',
    tags: ['teddy', 'bear', 'heart', 'cuddle', 'toy', 'hug', 'love']
  },
  {
    id: 'sleepy_coffee',
    emoji1: '☕',
    emoji2: '🥱',
    name: 'Monday Morning',
    description: 'A yawning espresso mug with heavy eyelids and floating Zzzs.',
    assetUrl: '/emoji-kitchen/sleepy_coffee.webp',
    tags: ['coffee', 'yawn', 'sleepy', 'tired', 'morning', 'work']
  },
  {
    id: 'avocado_taco',
    emoji1: '🌮',
    emoji2: '🥑',
    name: 'Guac Fiesta Taco',
    description: 'A crispy Mexican street taco loaded with fresh guacamole slices.',
    assetUrl: '/emoji-kitchen/avocado_taco.webp',
    tags: ['taco', 'avocado', 'mexican', 'food', 'snack', 'spicy']
  },
  {
    id: 'cool_fire',
    emoji1: '😎',
    emoji2: '🔥',
    name: 'Fire Shades',
    description: 'A super cool face in black sunglasses completely ablaze in fire.',
    assetUrl: '/emoji-kitchen/cool_fire.webp',
    tags: ['sunglasses', 'fire', 'cool', 'flame', 'badass', 'rad']
  },
  {
    id: 'sparkle_heart',
    emoji1: '✨',
    emoji2: '❤️',
    name: 'Glimmering Heart',
    description: 'A radiant faceted ruby crystal heart showering diamond sparkles.',
    assetUrl: '/emoji-kitchen/sparkle_heart.webp',
    tags: ['sparkle', 'heart', 'glimmer', 'diamond', 'shiny', 'gem', 'love']
  }
];

// Build fast O(1) map for combination lookups
export const EMOJI_KITCHEN_MAP: Record<string, EmojiBlend> = {};

ALL_EMOJI_BLENDS.forEach(blend => {
  const key = getBlendPairKey(blend.emoji1, blend.emoji2);
  EMOJI_KITCHEN_MAP[key] = blend;
});

// Extract all unique standard emojis that have supported blends
export const SUPPORTED_BASE_EMOJIS: string[] = Array.from(
  new Set(ALL_EMOJI_BLENDS.flatMap(b => [b.emoji1, b.emoji2]))
);

// Lookup function: Find a blend for any two emojis
export function findEmojiBlend(e1: string, e2: string): EmojiBlend | null {
  if (!e1 || !e2) return null;
  const key = getBlendPairKey(e1, e2);
  return EMOJI_KITCHEN_MAP[key] || null;
}

// Get all compatible partners for a given emoji
export function getCompatibleEmojis(e: string): { emoji: string; blend: EmojiBlend }[] {
  if (!e) return [];
  const norm = e.trim();
  const matches: { emoji: string; blend: EmojiBlend }[] = [];
  
  ALL_EMOJI_BLENDS.forEach(b => {
    if (b.emoji1 === norm) {
      matches.push({ emoji: b.emoji2, blend: b });
    } else if (b.emoji2 === norm) {
      matches.push({ emoji: b.emoji1, blend: b });
    }
  });
  
  return matches;
}

// Pick a random blend
export function getRandomBlend(): EmojiBlend {
  const idx = Math.floor(Math.random() * ALL_EMOJI_BLENDS.length);
  return ALL_EMOJI_BLENDS[idx];
}

// Format token for inline embedding in captions, comments, and messages
export function formatBlendToken(blend: EmojiBlend): string {
  return `[kitchen:${blend.id}]`;
}

// Look up a blend by its ID
export function getBlendById(id: string): EmojiBlend | null {
  return ALL_EMOJI_BLENDS.find(b => b.id === id) || null;
}

// Real-time detection in text strings:
// Checks if any supported emoji pair appears adjacent or separated by up to 1 whitespace
export function detectEmojiBlendInText(text: string): {
  blend: EmojiBlend;
  index: number;
  match: string;
} | null {
  if (!text || text.length < 2) return null;

  for (const blend of ALL_EMOJI_BLENDS) {
    const p1 = `${blend.emoji1}${blend.emoji2}`;
    const p2 = `${blend.emoji2}${blend.emoji1}`;
    const p1Space = `${blend.emoji1} ${blend.emoji2}`;
    const p2Space = `${blend.emoji2} ${blend.emoji1}`;

    const candidates = [p1, p2, p1Space, p2Space];
    for (const cand of candidates) {
      const idx = text.indexOf(cand);
      if (idx !== -1) {
        return {
          blend,
          index: idx,
          match: cand
        };
      }
    }
  }

  return null;
}
