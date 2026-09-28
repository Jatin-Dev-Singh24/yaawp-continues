import {
  UserProfile,
  UserSummary,
  Post,
  Story,
  Reel,
  NotificationItem,
  ChatConversation,
  FilterPreset,
  Community,
  Discussion,
  Challenge,
  AchievementBadge
} from '../types';

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'badge_1',
    name: 'Pioneer Visionary',
    icon: '✨',
    description: 'Founding participant in visual communities',
    rarity: 'legendary',
    earnedAt: 'Recently'
  },
  {
    id: 'badge_2',
    name: 'Story Weaver',
    icon: '📖',
    description: 'Published thought-provoking discussions',
    rarity: 'epic',
    earnedAt: 'Recently'
  },
  {
    id: 'badge_3',
    name: 'Momentum Master',
    icon: '⚡',
    description: 'Maintained a creative challenge streak',
    rarity: 'rare',
    earnedAt: 'Recently'
  },
  {
    id: 'badge_4',
    name: 'Community Anchor',
    icon: '⚓',
    description: 'Top contributor in creative communities',
    rarity: 'epic',
    earnedAt: 'Recently'
  }
];

export const CURRENT_USER: UserProfile = {
  id: 'user_current',
  username: 'creator',
  name: 'New Creator',
  avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=creator',
  isVerified: false,
  bio: 'Visual creator on YAAWP.',
  website: '',
  preferred_language: 'en',
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  interests: [],
  badges: [],
  challengesCompleted: 0,
  challengesCount: 0,
  communitiesJoined: [],
  isPrivate: false,
  highlights: []
};

export const USERS: Record<string, UserSummary> = {};

export const USER_PROFILES: Record<string, UserProfile> = {
  [CURRENT_USER.id]: CURRENT_USER
};

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_REELS: Reel[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [];

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Normal', filterClass: 'filter-normal', previewColor: '#cbd5e1' },
  { id: 'clarendon', name: 'Clarendon', filterClass: 'filter-clarendon', previewColor: '#38bdf8' },
  { id: 'lark', name: 'Lark', filterClass: 'filter-lark', previewColor: '#86efac' },
  { id: 'juno', name: 'Juno', filterClass: 'filter-juno', previewColor: '#f472b6' },
  { id: 'slumber', name: 'Slumber', filterClass: 'filter-slumber', previewColor: '#fdba74' },
  { id: 'ludwig', name: 'Ludwig', filterClass: 'filter-ludwig', previewColor: '#d8b4fe' },
  { id: 'reyes', name: 'Reyes', filterClass: 'filter-reyes', previewColor: '#fef08a' },
  { id: 'moon', name: 'Moon (B&W)', filterClass: 'filter-moon', previewColor: '#94a3b8' },
  { id: 'vintage', name: 'Vintage', filterClass: 'filter-vintage', previewColor: '#e2e8f0' },
  { id: 'dramatic', name: 'Dramatic', filterClass: 'filter-dramatic', previewColor: '#64748b' }
];

export const EXPLORE_PRESETS: any[] = [];

export const PRESET_CREATION_PHOTOS: { url: string; title: string; location: string }[] = [];

export const INITIAL_COMMUNITIES: Community[] = [];

export const INITIAL_DISCUSSIONS: Discussion[] = [];

export const INITIAL_CHALLENGES: Challenge[] = [];

export const INITIAL_CIRCLES: any[] = [];

export const INITIAL_NEARBY_ACTIVITIES: any[] = [];
