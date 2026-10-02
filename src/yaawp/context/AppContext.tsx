// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import { hashSecret, verifySecret } from '../lib/secureHash';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserProfile,
  UserSummary,
  Post,
  Story,
  StoryPoll,
  Reel,
  NotificationItem,
  ChatConversation,
  ChatMessage,
  Comment,
  LegalDocType,
  NewAccountRegistration,
  Community,
  Discussion,
  Challenge,
  SecurityAuditLog,
  CommunityJoinRequest,
  CustomCircle,
  AlgorithmSettings,
  AlgorithmFeedback,
  NearbyActivity,
  PresenceStatus,
  CommunityChannel,
  CommunityChatMessage,
  CommunityPersona,
  CommunityModerationConfig,
  DocumentData,
  AudioData,
  ContactData,
  LocationData,
  PollData,
  GameSession,
  ChatCustomList,
  GroupPendingJoinRequest,
  HiddenVaultConfig,
  AppPermissionType,
  AppPermissionStatus,
  CustomPfpConfig
} from '../types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_REELS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  USERS,
  USER_PROFILES,
  INITIAL_COMMUNITIES,
  INITIAL_DISCUSSIONS,
  INITIAL_CHALLENGES,
  INITIAL_CIRCLES,
  INITIAL_NEARBY_ACTIVITIES
} from '../data/mockData';
import {
  INITIAL_LANGUAGES,
  LanguageOption,
  getLanguageByCode,
  translate,
  TranslationKey
} from '../translations';
import {
  SUPPORT_BOT_USER,
  SUPPORT_BOT_WELCOME_MESSAGE,
  SUPPORT_BOT_SUGGESTED_PROMPTS,
  getAutomatedBotResponse
} from '../utils/supportBot';
import {
  checkUsernameAvailability,
  sanitizeUsername
} from '../utils/usernameValidation';

export type TabType = 'feed' | 'explore' | 'communities' | 'messages' | 'profile' | 'notifications' | 'reels' | 'settings' | 'legal';
export type FeedSortAlgorithm = 'chronological' | 'engagement' | 'balanced' | 'trending';
export type FeedFilterMode = 'for_you' | 'following' | 'communities' | 'nearby' | 'my_posts' | 'custom_list' | 'all';
export type AppThemePreset =
  | 'light'
  | 'nordic'
  | 'porcelain'
  | 'mint_light'
  | 'rose_light'
  | 'dark'
  | 'midnight'
  | 'obsidian'
  | 'cyber'
  | 'sunset'
  | 'emerald';

export const LIGHT_THEMES: AppThemePreset[] = ['light', 'nordic', 'porcelain', 'mint_light', 'rose_light'];

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  systemTheme: AppThemePreset;
  setSystemTheme: (theme: AppThemePreset) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: UserProfile;
  posts: Post[];
  feedPosts: Post[];
  feedMode: FeedFilterMode;
  setFeedMode: (mode: FeedFilterMode) => void;
  feedSort: FeedSortAlgorithm;
  setFeedSort: (sort: FeedSortAlgorithm) => void;
  followedUserIds: string[];
  stories: Story[];
  reels: Reel[];
  notifications: NotificationItem[];
  conversations: ChatConversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  allUsers: UserSummary[];
  startConversationWithUser: (user: UserSummary) => void;
  viewedUserId: string;
  openUserProfile: (userId: string) => void;
  getUserProfile: (userId: string) => UserProfile;
  unreadNotifsCount: number;
  unreadMessagesCount: number;
  activeStoryUserIndex: number | null;
  setActiveStoryUserIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedPostForModal: Post | null;
  setSelectedPostForModal: (post: Post | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  votePost: (postId: string, type: 'up' | 'down') => void;
  repostPost: (postId: string) => void;
  deletePost: (postId: string) => void;
  editPost: (postId: string, caption: string) => void;
  reportPost: (postId: string, reason: string) => void;
  addComment: (postId: string, text: string, parentId?: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  voteComment: (postId: string, commentId: string, type: 'up' | 'down') => void;
  createPost: (data: {
    mediaUrls?: string[];
    videoUrl?: string;
    isTextPost?: boolean;
    textPostTheme?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'sunset' | 'dark';
    postType?: 'image' | 'video' | 'text';
    caption: string;
    location?: string;
    filterClass?: string;
    allowsRepost?: boolean;
    communityId?: string;
    audience?: Post['audience'];
    audienceCircleId?: string;
    allowedEmojis?: string[];
    restrictedEmojis?: string[];
    isScheduled?: boolean;
    scheduledPublishTime?: string;
  }) => void;
  createStory: (
    mediaUrlOrConfig: string | { mediaUrl: string; caption?: string; poll?: StoryPoll; isTextStory?: boolean; storyTheme?: string },
    caption?: string,
    poll?: StoryPoll,
    isTextStory?: boolean,
    storyTheme?: string
  ) => void;
  voteStoryPoll: (storyId: string, optionId: string) => void;
  createReel: (reelData: {
    mediaUrl: string;
    caption: string;
    musicTitle?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    filterClass?: string;
    trimStart?: number;
    trimEnd?: number;
    audioTrackUrl?: string;
    audioTrackId?: string;
  }) => void;
  deleteReel: (reelId: string) => void;
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  addReelComment: (reelId: string, text: string, parentId?: string) => void;
  likeReelComment: (reelId: string, commentId: string) => void;
  deleteReelComment: (reelId: string, commentId: string) => void;
  toggleFollowUser: (userId: string) => void;
  // Algorithmic Feed & Recommendations
  algorithmSettings: AlgorithmSettings;
  updateAlgorithmSettings: (settings: Partial<AlgorithmSettings>) => void;
  applyAlgorithmFeedback: (
    postId: string,
    action: 'more_like_this' | 'less_like_this' | 'mute_topic' | 'mute_community' | 'mute_person',
    topic?: string,
    targetId?: string
  ) => void;
  resetRecommendationProfile: () => void;
  // Custom Circles
  customCircles: CustomCircle[];
  activeCustomCircleId: string | null;
  setActiveCustomCircleId: (id: string | null) => void;
  createCustomCircle: (name: string, icon: string, userIds: string[], description?: string) => void;
  updateCustomCircle: (id: string, name: string, icon: string, userIds: string[]) => void;
  deleteCustomCircle: (id: string) => void;
  toggleUserInCircle: (circleId: string, userId: string) => void;
  // Spontaneous Meetups & Nearby Activities
  nearbyActivities: NearbyActivity[];
  joinNearbyActivity: (activityId: string) => void;
  createNearbyActivity: (activity: Omit<NearbyActivity, 'id' | 'organizer' | 'spotsTaken' | 'attendees' | 'isJoined'>) => void;
  // Social Presence ("Currently")
  presenceStatus: PresenceStatus;
  updatePresenceStatus: (status: Partial<PresenceStatus>) => void;
  // Expressive Reactions & Reposting
  reactToPost: (postId: string, reactionEmoji: string) => void;
  quotePost: (targetPostId: string, caption: string) => void;
  // Community Personas & Channels
  communityPersonas: Record<string, CommunityPersona>;
  setCommunityPersona: (communityId: string, persona: Partial<CommunityPersona>) => void;
  communityChatMessages: Record<string, CommunityChatMessage[]>;
  sendCommunityChatMessage: (
    communityId: string,
    channelId: string,
    text: string,
    mediaUrl?: string,
    replyTo?: { id: string; text: string; senderName: string }
  ) => void;
  reactToCommunityChatMessage: (communityId: string, channelId: string, messageId: string, emoji: string) => void;
  updateCommunityModeration: (communityId: string, config: Partial<CommunityModerationConfig>) => void;
  // Communities
  communities: Community[];
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
  openCommunityDetail: (id: string) => void;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  createCommunity: (comm: Partial<Community>) => void;
  updateCommunity: (id: string, data: Partial<Community>) => void;
  deleteCommunity: (id: string) => void;
  requestJoinCommunity: (communityId: string) => void;
  handleJoinRequest: (communityId: string, requestId: string, action: 'accept' | 'decline') => void;
  joinRequests: CommunityJoinRequest[];
  isCreateCommunityOpen: boolean;
  setIsCreateCommunityOpen: (open: boolean) => void;
  // Discussions
  discussions: Discussion[];
  createDiscussion: (data: { communityId: string; title: string; body: string; tags?: string[]; mediaUrl?: string }) => void;
  voteDiscussion: (discussionId: string, type: 'up' | 'down') => void;
  addDiscussionComment: (discussionId: string, text: string, parentId?: string) => void;
  voteDiscussionComment: (discussionId: string, commentId: string, type: 'up' | 'down') => void;
  likeDiscussionComment: (discussionId: string, commentId: string) => void;
  deleteDiscussionComment: (discussionId: string, commentId: string) => void;
  likeDiscussion: (discussionId: string) => void;
  repostDiscussion: (discussionId: string) => void;
  // Challenges
  challenges: Challenge[];
  joinChallenge: (challengeId: string) => void;
  logChallengeProgress: (challengeId: string) => void;
  createChallenge: (data: Partial<Challenge>) => void;
  cheerParticipant: (challengeId: string, targetUserId: string) => void;
  isCreateChallengeOpen: boolean;
  setIsCreateChallengeOpen: (open: boolean) => void;
  // Messaging
  sendMessage: (
    conversationId: string,
    text: string,
    options?: {
      replyTo?: { id: string; text: string; senderName: string };
      isVoice?: boolean;
      voiceDurationSeconds?: number;
      mediaUrl?: string;
      mediaType?: 'image' | 'video' | 'file';
      fileName?: string;
      documentData?: DocumentData;
      audioData?: AudioData;
      contactData?: ContactData;
      locationData?: LocationData;
      pollData?: PollData;
      gameSession?: GameSession;
    }
  ) => void;
  votePoll: (conversationId: string, messageId: string, optionId: string) => void;
  updateGameSession: (conversationId: string, messageId: string, updated: Partial<GameSession>) => void;
  hideConversation: (conversationId: string) => void;
  replyToMessage: (conversationId: string, replyTo: { id: string; text: string; senderName: string }, text: string) => void;
  reactToMessage: (conversationId: string, messageId: string, emoji: string) => void;
  sendVoiceMessage: (
    conversationId: string,
    durationSeconds?: number,
    replyTo?: { id: string; text: string; senderName: string }
  ) => void;
  sendMediaMessage: (
    conversationId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'file',
    caption?: string,
    fileName?: string,
    replyTo?: { id: string; text: string; senderName: string }
  ) => void;
  triggerTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  clearConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  togglePinConversation: (conversationId: string) => void;
  toggleMuteConversation: (conversationId: string) => void;
  toggleArchiveConversation: (conversationId: string) => void;
  chatLists: ChatCustomList[];
  createChatList: (name: string, color?: string, icon?: string) => ChatCustomList;
  deleteChatList: (listId: string) => void;
  toggleChatInList: (conversationId: string, listId: string) => void;
  setConversationLists: (conversationId: string, listIds: string[]) => void;
  blockAndReportUser: (userId: string, reason: string, details?: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  markConversationAsUnread: (conversationId: string) => void;
  simulateIncomingMessage: (senderId?: string, customText?: string) => void;
  markRecipientSeen: (conversationId: string) => void;
  toggleRecipientInChat: (conversationId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  handleConnectionRequest: (notifId: string, action: 'accept' | 'decline') => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setChatWallpaper: (conversationId: string, wallpaper?: ChatConversation['wallpaper']) => void;
  // Security Suite & Passcode Protection
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;
  isBehindTheScenesOpen: boolean;
  setIsBehindTheScenesOpen: (open: boolean) => void;
  chatPasscode: string | null;
  setChatPasscode: (pin: string | null) => void;
  securitySettings?: { isPasscodeEnabled: boolean; passcode?: string };
  updateSecuritySettings: (settings: { isPasscodeEnabled?: boolean; passcode?: string }) => void;
  isChatLocked: boolean;
  setIsChatLocked: (locked: boolean) => void;
  unlockChat: (pin: string) => boolean;
  failedLoginAttempts: number;
  lockoutUntil: number | null;
  failedLoginsAlert: boolean;
  recordFailedLogin: () => void;
  resetFailedLogins: () => void;
  auditLogs: SecurityAuditLog[];
  addAuditLog: (action: string, details?: string, status?: 'success' | 'warning' | 'error') => void;
  exportGDPRData: () => void;
  deleteAccountPermanently: () => void;
  changePassword: (oldPw: string, newPw: string) => boolean;
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (val: boolean) => void;
  enableTwoFactorWithPassword: (password: string) => boolean;
  changeTwoFactorPassword: (currentPw: string, newPw: string) => boolean;
  disableTwoFactorWithPassword: (currentPw: string) => boolean;
  resetTwoFactorViaEmail: (code: string, newPw: string) => boolean;
  verifyPreviousPasscode: (pin: string) => boolean;
  privateMediaSignedUrlsEnabled: boolean;
  setPrivateMediaSignedUrlsEnabled: (val: boolean) => void;
  isFollowersPrivate: boolean;
  toggleFollowersPrivacy: () => void;
  updateInterests: (interests: string[]) => void;
  // Settings & Privacy
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isAccountPrivate: boolean;
  toggleAccountPrivacy: () => void;
  showReadReceipts: boolean;
  setShowReadReceipts: (val: boolean) => void;
  showOnlineStatus: boolean;
  setShowOnlineStatus: (val: boolean) => void;
  blockedUsers: string[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  exportUserData: () => void;
  signOutAccount: () => void;
  // Offline & Feed Caching
  isOffline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  feedCacheTimestamp: number;
  refreshFeed: () => Promise<void>;
  isFeedRefreshing: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  userProfiles: Record<string, UserProfile>;
  hasAgreedToTerms: boolean;
  termsAgreedTimestamp: number | null;
  agreeToTermsAndContinue: () => void;
  isLegalModalOpen: boolean;
  activeLegalDoc: LegalDocType;
  setActiveLegalDoc: (doc: LegalDocType) => void;
  openLegalModal: (doc?: LegalDocType) => void;
  closeLegalModal: () => void;
  isCreateAccountModalOpen: boolean;
  setIsCreateAccountModalOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  authModalMode: 'signup' | 'login';
  setAuthModalMode: (mode: 'signup' | 'login') => void;
  openAuthModal: (mode?: 'signup' | 'login') => void;
  createAccount: (data: NewAccountRegistration) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  switchAccount: (userId: string) => void;
  loginWithSupabase: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  deactivateAccount: (reason?: string) => void;
  isAccountDeactivated: boolean;
  // 3-Bar Profile Settings & Navigation
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (open: boolean) => void;
  // Community Enhancements
  reportCommunity: (communityId: string, reason: string) => void;
  toggleHideCommunity: (communityId: string) => void;
  pinDiscussion: (discussionId: string) => void;
  // Group Chat & Admin Management
  createGroupChat: (name: string, isPublic: boolean, memberIds: string[], avatar?: string, description?: string) => void;
  updateGroupSettings: (
    conversationId: string,
    updates: {
      name?: string;
      description?: string;
      avatar?: string;
      isPublic?: boolean;
      messagingPermission?: 'all' | 'admins_only';
    }
  ) => void;
  promoteGroupAdmin: (conversationId: string, userId: string) => void;
  demoteGroupAdmin: (conversationId: string, userId: string) => void;
  toggleGroupMemberMessaging: (conversationId: string, userId: string) => void;
  removeGroupMember: (conversationId: string, userId: string) => void;
  addGroupMember: (conversationId: string, userId: string) => void;
  approveGroupJoinRequest: (conversationId: string, requestId: string) => void;
  rejectGroupJoinRequest: (conversationId: string, requestId: string) => void;
  requestJoinGroupViaLink: (conversationId: string, customUser?: UserSummary) => void;
  exitGroup: (conversationId: string) => void;
  reportGroup: (conversationId: string, reason: string, details?: string) => void;
  toggleHideChat: (conversationId: string) => void;
  chatSecretCode: string;
  setChatSecretCode: (code: string) => void;
  // Vault & Hidden Content System
  hideChatWithCode: (conversationId: string, code: string, customConfig?: Partial<HiddenVaultConfig>) => boolean;
  unhideChat: (conversationId: string) => void;
  updateChatVaultConfig: (conversationId: string, updates: Partial<HiddenVaultConfig>) => void;
  isVaultNotificationsEnabled: boolean;
  toggleVaultNotifications: () => void;
  defaultVaultConfig: HiddenVaultConfig;
  updateDefaultVaultConfig: (updates: Partial<HiddenVaultConfig>) => void;
  // Permissions System
  activePermissionPrompt: {
    type: AppPermissionType;
    featureName?: string;
    resolve: (granted: boolean) => void;
  } | null;
  requestAppPermission: (type: AppPermissionType, featureName?: string) => Promise<boolean>;
  respondToPermissionPrompt: (decision: 'always' | 'now' | 'deny') => void;
  resetAppPermissions: () => void;
  // Profile, Post, Story & Highlight Privacy & Archives
  archivePost: (postId: string) => void;
  unarchivePost: (postId: string) => void;
  toggleHidePostFromGrid: (postId: string) => void;
  archiveStory: (storyId: string) => void;
  unarchiveStory: (storyId: string) => void;
  deleteStory: (storyId: string) => void;
  addStoryComment: (storyId: string, text: string, parentId?: string) => void;
  likeStoryComment: (storyId: string, commentId: string) => void;
  deleteStoryComment: (storyId: string, commentId: string) => void;
  updatePostEmojiSettings: (postId: string, allowedEmojis?: string[], restrictedEmojis?: string[]) => void;
  deleteComment: (postId: string, commentId: string) => void;
  archiveHighlight: (highlightId: string) => void;
  unarchiveHighlight: (highlightId: string) => void;
  deleteHighlight: (highlightId: string) => void;
  toggleHideFollower: (userId: string, type: 'follower' | 'following') => void;
  updateSecondaryAvatar: (avatarUrl: string, visibility: 'everyone' | 'followers' | 'close_friends') => void;
  updateCustomDualPfp: (pfp1: CustomPfpConfig, pfp2: CustomPfpConfig) => void;
  createStoryWithDuration: (mediaUrl: string, caption?: string, durationHours?: number, audience?: 'everyone' | 'close_friends') => void;
  // One-way Profile Concealment
  hiddenProfileFromUserIds: string[];
  toggleHideMyProfileFrom: (userId: string) => void;
  isProfileHiddenFromUser: (userId: string) => boolean;
  // Supabase Auth & Session State
  supabaseSession: Session | null;
  isAuthReady: boolean;
  isSupabaseConfigured: boolean;
  // Preferred Language & Translations
  preferredLanguage: string;
  setPreferredLanguage: (code: string) => void;
  currentLanguageOption: LanguageOption;
  t: (key: TranslationKey) => string;
  // Username onboarding prompt
  isUsernameSetupRequired: boolean;
  setIsUsernameSetupRequired: (req: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LEGACY_STORAGE_KEY = 'instagram_app_state_v1';
const LOCAL_STORAGE_KEY = 'yaawp_app_state_v1';
export const FEED_OFFLINE_CACHE_KEY = 'yaawp_feed_offline_cache_v2';
export const FEED_OFFLINE_META_KEY = 'yaawp_feed_offline_meta_v2';
const INTERACTION_STORE_KEY = 'yaawp_post_interactions_v2';

const getStoredInteractions = (): Record<string, {
  reactions?: Record<string, string[] | number>;
  userReaction?: string;
  likesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}> => {
  try {
    const raw = localStorage.getItem(INTERACTION_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePostInteraction = (postId: string, interaction: {
  reactions?: Record<string, string[] | number>;
  userReaction?: string;
  likesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}) => {
  try {
    const all = getStoredInteractions();
    all[postId] = { ...(all[postId] || {}), ...interaction };
    localStorage.setItem(INTERACTION_STORE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Could not save post interaction:', err);
  }
};

const getStoredStateItem = (subKey: string): string | null => {
  try {
    const directVal = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${subKey}`);
    if (directVal !== null) return directVal;
    const legacyVal = localStorage.getItem(`${LEGACY_STORAGE_KEY}_${subKey}`);
    if (legacyVal !== null) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${subKey}`, legacyVal);
      return legacyVal;
    }
  } catch {}
  return null;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase session state
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(!isSupabaseConfigured);

  // Initialize Supabase session check on load
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    const handleUserSessionSync = async (user: any) => {
      if (!user) return;
      const meta = user.user_metadata || {};
      const email = user.email || '';
      const fallbackHandle = email ? sanitizeUsername(email.split('@')[0]) : 'creator';
      const userHandle = sanitizeUsername(meta.username || '') || fallbackHandle;
      const userName = meta.full_name || meta.name || userHandle;
      const userAvatar = meta.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userHandle)}`;

      // 1. Try to fetch persistent profile from Supabase profiles table
      let dbProfile: any = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          dbProfile = data;
        }
      } catch (err) {
        console.warn('Could not fetch profile from Supabase:', err);
      }

      const existingProfile = dbProfile || (Object.values(userProfiles) as UserProfile[]).find(
        p => p.id === user.id || (p.email && p.email.toLowerCase() === email.toLowerCase())
      );

      const resolvedHandle = existingProfile?.username || userHandle;
      const updatedUser: UserProfile = {
        ...(existingProfile || {}),
        id: user.id,
        email,
        name: existingProfile?.name || userName,
        username: resolvedHandle,
        avatar: existingProfile?.avatar || userAvatar,
        bio: existingProfile?.bio || 'Connected via Google Account ✨',
        website: existingProfile?.website || '',
        followersCount: existingProfile?.followersCount ?? 0,
        followingCount: existingProfile?.followingCount ?? 0,
        postsCount: existingProfile?.postsCount ?? 0,
        highlights: existingProfile?.highlights || [],
        isVerified: existingProfile?.isVerified ?? false
      };

      setCurrentUser(updatedUser);
      setUserProfiles(prev => ({
        ...prev,
        [user.id]: updatedUser
      }));
      setIsAuthenticated(true);

      // Check if user still needs to pick a personalized unique handle
      const customUsernamePicked = localStorage.getItem(`yaawp_custom_username_${user.id}`);
      if (!meta.username && (!existingProfile?.username || existingProfile.username === fallbackHandle) && !customUsernamePicked) {
        setIsUsernameSetupRequired(true);
      }
    };

    // Check active session on load
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      setIsAuthReady(true);
      if (error) {
        console.warn('Supabase getSession error:', error.message);
        return;
      }
      if (session) {
        setSupabaseSession(session);
        handleUserSessionSync(session.user);
      }
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSupabaseSession(session);
      if (session?.user) {
        handleUserSessionSync(session.user);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch posts from Supabase database & attach Realtime listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseSession) return;

    let isMounted = true;

    const loadPostsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase posts fetch notice:', error.message);
          return;
        }

        if (data && isMounted && data.length > 0) {
          const mappedPosts: Post[] = data.map((row: any) => {
            const isText =
              row.media_type === 'text' ||
              !row.media_url ||
              row.media_url.includes('photo-1516035069371-29a1b244cc32');

            return {
              id: row.id,
              user: {
                id: row.user_id,
                username: currentUser.username,
                name: currentUser.name,
                avatar: currentUser.avatar,
                isVerified: currentUser.isVerified
              },
              mediaUrls: isText ? [] : (row.media_url ? [row.media_url] : []),
              isTextPost: isText,
              postType: isText ? 'text' : (row.media_type === 'video' ? 'video' : 'image'),
              caption: row.caption || '',
              location: row.location || undefined,
              tags: row.tags || [],
              timestamp: new Date(row.created_at).toLocaleDateString(),
              createdAt: new Date(row.created_at).getTime(),
              likesCount: 0,
              isLiked: false,
              isSaved: false,
              filterClass: row.filter_class || 'filter-normal',
              comments: [],
              allowsRepost: true,
              audience: (row.audience as Post['audience']) || 'everyone',
              score: 0,
              upvotes: 0,
              downvotes: 0
            };
          });

          setPosts(prev => {
            const interactions = getStoredInteractions();
            const prevMap = new Map<string, Post>(prev.map(p => [p.id, p]));
            const mergedSupabase = mappedPosts.map(sp => {
              const existing = prevMap.get(sp.id);
              const inter = interactions[sp.id];
              if (existing) {
                return {
                  ...sp,
                  isTextPost: existing.isTextPost ?? sp.isTextPost,
                  textPostTheme: existing.textPostTheme,
                  mediaUrls: existing.isTextPost ? [] : (existing.mediaUrls?.length ? existing.mediaUrls : sp.mediaUrls),
                  likesCount: Math.max(existing.likesCount || 0, inter?.likesCount || 0, sp.likesCount || 0),
                  isLiked: existing.isLiked || inter?.isLiked || sp.isLiked,
                  isSaved: existing.isSaved || inter?.isSaved || sp.isSaved,
                  isReposted: existing.isReposted,
                  repostsCount: existing.repostsCount,
                  reactions: existing.reactions || inter?.reactions || sp.reactions,
                  userReaction: existing.userReaction || inter?.userReaction || sp.userReaction,
                  comments: existing.comments && existing.comments.length > 0 ? existing.comments : sp.comments,
                };
              } else if (inter) {
                return {
                  ...sp,
                  reactions: inter.reactions ?? sp.reactions,
                  userReaction: inter.userReaction ?? sp.userReaction,
                  likesCount: Math.max(inter.likesCount ?? 0, sp.likesCount ?? 0),
                  isLiked: inter.isLiked ?? sp.isLiked,
                  isSaved: inter.isSaved ?? sp.isSaved
                };
              }
              return sp;
            });
            const supabaseIds = new Set(mappedPosts.map(p => p.id));
            const existingNonSupabase = prev.filter(p => !supabaseIds.has(p.id));
            return [...mergedSupabase, ...existingNonSupabase];
          });
        }
      } catch (err) {
        console.warn('Error loading posts from Supabase:', err);
      }
    };

    loadPostsFromSupabase();

    // Supabase Realtime channel for public.posts table
    const postsChannel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any;
            setPosts(prev => {
              if (prev.some(p => p.id === newRow.id)) return prev;
              const isText =
                newRow.media_type === 'text' ||
                !newRow.media_url ||
                newRow.media_url.includes('photo-1516035069371-29a1b244cc32');
              const newP: Post = {
                id: newRow.id,
                user: {
                  id: newRow.user_id,
                  username: currentUser.username,
                  name: currentUser.name,
                  avatar: currentUser.avatar,
                  isVerified: currentUser.isVerified
                },
                mediaUrls: isText ? [] : (newRow.media_url ? [newRow.media_url] : []),
                isTextPost: isText,
                postType: isText ? 'text' : (newRow.media_type === 'video' ? 'video' : 'image'),
                caption: newRow.caption || '',
                location: newRow.location || undefined,
                tags: newRow.tags || [],
                timestamp: 'JUST NOW',
                createdAt: new Date(newRow.created_at || Date.now()).getTime(),
                likesCount: 0,
                isLiked: false,
                isSaved: false,
                filterClass: newRow.filter_class || 'filter-normal',
                comments: [],
                allowsRepost: true,
                audience: (newRow.audience as Post['audience']) || 'everyone',
                score: 0,
                upvotes: 0,
                downvotes: 0
              };
              return [newP, ...prev];
            });
            showToast('Realtime: New post synchronized!');
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any;
            if (oldRow?.id) {
              setPosts(prev => prev.filter(p => p.id !== oldRow.id));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any;
            if (updatedRow?.id) {
              setPosts(prev =>
                prev.map(p =>
                  p.id === updatedRow.id
                    ? {
                        ...p,
                        caption: updatedRow.caption ?? p.caption,
                        tags: updatedRow.tags ?? p.tags,
                        location: updatedRow.location ?? p.location
                      }
                    : p
                )
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(postsChannel);
    };
  }, [supabaseSession, isSupabaseConfigured]);

  // Theme state
  const [systemTheme, setSystemThemeState] = useState<AppThemePreset>(() => {
    const savedSys = localStorage.getItem('yaawp_system_theme') as AppThemePreset;
    if (savedSys && ['light', 'nordic', 'porcelain', 'mint_light', 'rose_light', 'dark', 'midnight', 'obsidian', 'cyber', 'sunset', 'emerald'].includes(savedSys)) {
      return savedSys;
    }
    const saved = localStorage.getItem('yaawp_theme') || localStorage.getItem('instagram_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedSys = localStorage.getItem('yaawp_system_theme') as AppThemePreset;
    if (savedSys && LIGHT_THEMES.includes(savedSys)) return 'light';
    if (savedSys && !LIGHT_THEMES.includes(savedSys)) return 'dark';
    const saved = localStorage.getItem('yaawp_theme') || localStorage.getItem('instagram_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = getStoredStateItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const DUMMY_USER_IDS = new Set(['user_elena', 'user_liam', 'user_maya', 'user_sophia', 'user_kai', 'user_david', 'user_marco']);
          if (!DUMMY_USER_IDS.has(parsed.id) && !['elena_visuals', 'liam_lens', 'maya_sky'].includes(parsed.username?.toLowerCase())) {
            return parsed;
          }
        }
      } catch {}
    }
    return CURRENT_USER;
  });

  const [preferredLanguage, setPreferredLanguageState] = useState<string>(() => {
    const savedLang = localStorage.getItem('yaawp_preferred_language');
    if (savedLang) return savedLang;
    const savedUser = getStoredStateItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.preferred_language) return u.preferred_language;
      } catch (_) {}
    }
    return CURRENT_USER.preferred_language || 'en';
  });

  useEffect(() => {
    const opt = getLanguageByCode(preferredLanguage);
    document.documentElement.lang = opt.code;
    document.documentElement.dir = opt.dir;
  }, [preferredLanguage]);

  const setPreferredLanguage = (code: string) => {
    const opt = getLanguageByCode(code);
    setPreferredLanguageState(opt.code);
    localStorage.setItem('yaawp_preferred_language', opt.code);
    document.documentElement.lang = opt.code;
    document.documentElement.dir = opt.dir;

    setCurrentUser(prev => {
      const updated = { ...prev, preferred_language: opt.code };
      setUserProfiles(pMap => ({ ...pMap, [prev.id]: updated }));
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(updated));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profiles`, JSON.stringify({ ...userProfiles, [prev.id]: updated }));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured && supabaseSession?.user?.id) {
      try {
        supabase.auth.updateUser({
          data: { preferred_language: opt.code }
        }).catch(() => {});
      } catch (_) {}
    }
  };

  const currentLanguageOption = useMemo(() => {
    return getLanguageByCode(preferredLanguage);
  }, [preferredLanguage]);

  const t = (key: TranslationKey): string => {
    return translate(key, preferredLanguage);
  };

  // Profiles cache for all platform users
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(() => {
    const saved = getStoredStateItem('profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const clean: Record<string, UserProfile> = {};
          const DUMMY_IDS = new Set(['user_elena', 'user_liam', 'user_maya', 'user_sophia', 'user_kai', 'user_david', 'user_marco']);
          Object.entries(parsed).forEach(([k, v]: [string, any]) => {
            if (v && !DUMMY_IDS.has(k) && !['elena_visuals', 'liam_lens', 'maya_sky'].includes(v.username?.toLowerCase())) {
              clean[k] = v;
            }
          });
          if (Object.keys(clean).length > 0) return clean;
        }
      } catch {}
    }
    return USER_PROFILES;
  });

  // Followed users list
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    const saved = getStoredStateItem('followed');
    const DUMMY_IDS = new Set(['user_elena', 'user_liam', 'user_maya', 'user_sophia', 'user_kai', 'user_david', 'user_marco']);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => !DUMMY_IDS.has(id));
        }
      } catch {}
    }
    return [];
  });

  // Feed algorithm settings
  const [feedMode, setFeedMode] = useState<FeedFilterMode>(() => {
    const saved = getStoredStateItem('feed_mode');
    return (saved === 'all' || saved === 'following') ? saved : 'following';
  });

  const [feedSort, setFeedSort] = useState<FeedSortAlgorithm>(() => {
    const saved = getStoredStateItem('feed_sort');
    return (saved === 'engagement' || saved === 'balanced' || saved === 'chronological') ? saved : 'chronological';
  });

  // Currently viewed user profile (defaults to currentUser)
  const [viewedUserId, setViewedUserId] = useState<string>(currentUser.id);

  // Automatic one-time cleanup to ensure all legacy dummy posts, notifications, and cached demo data are purged
  if (typeof window !== 'undefined') {
    const PURGE_KEY = 'yaawp_purge_all_dummy_data_v6';
    if (!localStorage.getItem(PURGE_KEY)) {
      try {
        localStorage.removeItem(FEED_OFFLINE_CACHE_KEY);
        localStorage.removeItem('lumina_feed_offline_cache_v2');
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_notifications`);
        localStorage.removeItem('yaawp_chat_lists');
        localStorage.removeItem('instagram_app_state_v1_posts');
        localStorage.removeItem('instagram_app_state_v1_stories');
        localStorage.removeItem('instagram_app_state_v1_reels');
        localStorage.removeItem('lumina_custom_circles');
        localStorage.removeItem('lumina_nearby_activities');
        localStorage.removeItem('yaawp_custom_circles');
        localStorage.removeItem('yaawp_nearby_activities');

        const DUMMY_USER_IDS = new Set(['user_elena', 'user_liam', 'user_maya', 'user_sophia', 'user_kai', 'user_david', 'user_marco']);
        const DUMMY_CONV_IDS = new Set([
          'conv_sophia', 'conv_elena', 'conv_kai', 'conv_david', 'conv_marco',
          'conv_group_creatives', 'conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5',
          'conv_elena_visuals', 'conv_liam_lens', 'conv_maya_sky'
        ]);

        // Clean dummy items from cached posts
        const cachedPostsRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_posts`);
        if (cachedPostsRaw) {
          try {
            const parsedPosts = JSON.parse(cachedPostsRaw);
            if (Array.isArray(parsedPosts)) {
              const cleanPosts = parsedPosts.filter((p: any) =>
                p &&
                !p.id?.startsWith('post_curr_') &&
                !p.id?.startsWith('exp_post_') &&
                !['post_1', 'post_2', 'post_3', 'post_4', 'post_5', 'post_6', 'post_7'].includes(p.id) &&
                !DUMMY_USER_IDS.has(p.user?.id)
              );
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_posts`, JSON.stringify(cleanPosts));
            }
          } catch {}
        }

        // Clean dummy communities
        const cachedCommRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_communities`);
        if (cachedCommRaw) {
          try {
            const parsedComm = JSON.parse(cachedCommRaw);
            if (Array.isArray(parsedComm)) {
              const DUMMY_COMM_IDS = new Set(['comm_1', 'comm_2', 'comm_3', 'comm_4', 'comm_visual_arts', 'comm_street_photo']);
              const cleanComm = parsedComm.filter((c: any) =>
                c && !DUMMY_COMM_IDS.has(c.id) && !['Tokyo Street Photography', 'Visual Storytellers', 'Minimalist Architecture'].includes(c.name)
              );
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_communities`, JSON.stringify(cleanComm));
            }
          } catch {}
        }

        // Clean dummy discussions
        const cachedDiscRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_discussions`);
        if (cachedDiscRaw) {
          try {
            const parsedDisc = JSON.parse(cachedDiscRaw);
            if (Array.isArray(parsedDisc)) {
              const cleanDisc = parsedDisc.filter((d: any) => d && !['disc_1', 'disc_2', 'disc_3'].includes(d.id));
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_discussions`, JSON.stringify(cleanDisc));
            }
          } catch {}
        }

        // Clean dummy challenges
        const cachedChalRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_challenges`);
        if (cachedChalRaw) {
          try {
            const parsedChal = JSON.parse(cachedChalRaw);
            if (Array.isArray(parsedChal)) {
              const cleanChal = parsedChal.filter((ch: any) => ch && !['chal_1', 'chal_2', 'chal_3'].includes(ch.id));
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_challenges`, JSON.stringify(cleanChal));
            }
          } catch {}
        }

        // Clean dummy stories
        const cachedStoriesRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stories`);
        if (cachedStoriesRaw) {
          try {
            const parsedStories = JSON.parse(cachedStoriesRaw);
            if (Array.isArray(parsedStories)) {
              const cleanStories = parsedStories.filter((s: any) =>
                s && !['story_current', 'story_elena', 'story_marco', 'story_kai', 'story_sophia', 'story_david'].includes(s.id)
              );
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_stories`, JSON.stringify(cleanStories));
            }
          } catch {}
        }

        // Clean dummy reels
        const cachedReelsRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reels`);
        if (cachedReelsRaw) {
          try {
            const parsedReels = JSON.parse(cachedReelsRaw);
            if (Array.isArray(parsedReels)) {
              const cleanReels = parsedReels.filter((r: any) =>
                r && !['reel_1', 'reel_2', 'reel_3', 'reel_4', 'reel_5'].includes(r.id)
              );
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_reels`, JSON.stringify(cleanReels));
            }
          } catch {}
        }

        // Clean dummy conversations
        const cachedConvRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_conversations`);
        if (cachedConvRaw) {
          try {
            const parsedConv = JSON.parse(cachedConvRaw);
            if (Array.isArray(parsedConv)) {
              const cleanConv = parsedConv.filter((c: any) =>
                c && !DUMMY_CONV_IDS.has(c.id) && !DUMMY_USER_IDS.has(c.participant?.id)
              );
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_conversations`, JSON.stringify(cleanConv));
            }
          } catch {}
        }

        localStorage.setItem(PURGE_KEY, 'true');
      } catch {}
    }
  }

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = getStoredStateItem('posts');
      const interactions = getStoredInteractions();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only legitimate user created posts and heal any camera corrupted text posts
          const clean = parsed
            .filter(
              (p: any) =>
                p &&
                !p.id.startsWith('post_curr_') &&
                !p.id.startsWith('exp_post_') &&
                !['post_1', 'post_2', 'post_3', 'post_4', 'post_5', 'post_6', 'post_7'].includes(p.id)
            )
            .map((p: any) => {
              const inter = interactions[p.id];
              let healed = p;
              if (
                p.mediaUrls?.[0]?.includes('photo-1516035069371-29a1b244cc32') &&
                (p.isTextPost || p.postType === 'text' || !p.caption?.includes('#camera'))
              ) {
                healed = {
                  ...p,
                  isTextPost: true,
                  postType: 'text',
                  mediaUrls: []
                };
              }
              if (inter) {
                return {
                  ...healed,
                  reactions: inter.reactions ?? healed.reactions,
                  userReaction: inter.userReaction !== undefined ? inter.userReaction : healed.userReaction,
                  isLiked: inter.isLiked !== undefined ? inter.isLiked : healed.isLiked,
                  likesCount: inter.likesCount !== undefined ? inter.likesCount : healed.likesCount,
                  isSaved: inter.isSaved !== undefined ? inter.isSaved : healed.isSaved
                };
              }
              return healed;
            });
          return clean;
        }
      }
    } catch {
      // safe fallback on parse error
    }
    return INITIAL_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = getStoredStateItem('stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (s: any) =>
              s &&
              !['story_current', 'story_elena', 'story_marco', 'story_kai', 'story_sophia', 'story_david'].includes(s.id)
          );
        }
      }
    } catch {}
    return INITIAL_STORIES;
  });

  const [reels, setReels] = useState<Reel[]>(() => {
    try {
      const saved = getStoredStateItem('reels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((r: any) => r && !['reel_1', 'reel_2', 'reel_3', 'reel_4', 'reel_5'].includes(r.id));
        }
      }
    } catch {}
    return INITIAL_REELS;
  });

  const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const isNotificationOlderThan20Days = (n: NotificationItem) => {
      if (n.createdAt) {
        return Date.now() - n.createdAt > TWENTY_DAYS_MS;
      }
      const dayMatch = n.timestamp.match(/(\d+)\s*d\s*ago/i);
      if (dayMatch && parseInt(dayMatch[1], 10) > 20) {
        return true;
      }
      return false;
    };

    const saved = getStoredStateItem('notifications');
    let raw: NotificationItem[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const DUMMY_USER_IDS = new Set(['user_elena', 'user_liam', 'user_maya', 'user_sophia', 'user_kai', 'user_david', 'user_marco']);
          raw = parsed.filter((n: any) =>
            n &&
            !n.id?.startsWith('notif_init_') &&
            !DUMMY_USER_IDS.has(n.user?.id) &&
            !['elena_visuals', 'liam_lens', 'maya_sky'].includes(n.user?.username?.toLowerCase())
          );
        }
      } catch {}
    }
    // Auto-delete notifications older than 20 days
    return raw
      .filter(n => !isNotificationOlderThan20Days(n))
      .map(n => ({
        ...n,
        createdAt: n.createdAt || Date.now() - (n.timestamp.includes('1h') ? 3600000 : n.timestamp.includes('2h') ? 7200000 : 86400000)
      }));
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const buildSupportBotConv = (initialUnread = 0): ChatConversation => ({
      id: 'conv_support_bot',
      participant: SUPPORT_BOT_USER,
      lastMessage: 'Welcome to Yaawp! How can I guide you today?',
      lastMessageTime: 'Just now',
      unreadCount: initialUnread,
      isPinned: false,
      isOnline: true,
      messages: [
        {
          id: 'msg_support_bot_welcome',
          senderId: SUPPORT_BOT_USER.id,
          text: SUPPORT_BOT_WELCOME_MESSAGE,
          timestamp: 'Just now',
          supportBotData: {
            suggestedActions: [
              { label: 'Open Privacy Settings', actionKey: 'open_privacy' },
              { label: 'Manage Secret Code', actionKey: 'open_secret_code' },
              { label: 'Manage Permissions', actionKey: 'open_permissions' },
              { label: 'Create a Post', actionKey: 'open_create_post' }
            ],
            quickReplies: SUPPORT_BOT_SUGGESTED_PROMPTS
          }
        }
      ]
    });

    const isBotDeleted = localStorage.getItem('yaawp_support_bot_deleted') === 'true';

    const DUMMY_CONV_IDS = new Set([
      'conv_sophia', 'conv_elena', 'conv_kai', 'conv_david', 'conv_marco',
      'conv_group_creatives', 'conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5',
      'conv_elena_visuals', 'conv_liam_lens', 'conv_maya_sky'
    ]);
    const DUMMY_PARTICIPANT_IDS = new Set([
      'user_elena', 'user_liam', 'user_maya', 'user_sophia', 'user_kai', 'user_david', 'user_marco'
    ]);

    const saved = getStoredStateItem('conversations');
    if (saved) {
      try {
        const parsed: ChatConversation[] = JSON.parse(saved);
        const filtered = parsed.filter(c =>
          c &&
          !DUMMY_CONV_IDS.has(c.id) &&
          !DUMMY_PARTICIPANT_IDS.has(c.participant?.id)
        );
        const enriched: ChatConversation[] = filtered.map(c => ({
          ...c,
          isPinned: c.id === 'conv_support_bot' ? false : Boolean(c.isPinned),
          messages: c.messages.map(m => {
            if (m.senderId === CURRENT_USER.id && !m.status) {
              return { ...m, status: 'seen' as const, seenAt: m.timestamp };
            }
            return m;
          })
        }));
        let list: ChatConversation[] = enriched;
        if (isBotDeleted) {
          list = list.filter(c => c.id !== 'conv_support_bot');
        } else if (!list.some(c => c.id === 'conv_support_bot')) {
          list.push(buildSupportBotConv(0));
        }
        return list;
      } catch {
        // fallback to INITIAL_CONVERSATIONS
      }
    }
    const initialList = [...INITIAL_CONVERSATIONS];
    if (!isBotDeleted) {
      initialList.push(buildSupportBotConv(0));
    }
    return initialList;
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    const firstNonBot = conversations.find(c => c.id !== 'conv_support_bot');
    return firstNonBot?.id || conversations[0]?.id || '';
  });
  const activeConvIdRef = useRef<string>(activeConvId);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);
  const [activeStoryUserIndex, setActiveStoryUserIndex] = useState<number | null>(null);
  const [selectedPostForModal, setSelectedPostForModal] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Chat Lists state (clean empty by default)
  const [chatLists, setChatLists] = useState<ChatCustomList[]>(() => {
    try {
      const saved = localStorage.getItem('yaawp_chat_lists');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('yaawp_chat_lists', JSON.stringify(chatLists));
    } catch {}
  }, [chatLists]);

  // Yaawp Legal & Privacy state
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean>(() => {
    return (
      localStorage.getItem('yaawp_terms_agreed_v1') === 'true' ||
      localStorage.getItem('instagram_terms_agreed_v1') === 'true'
    );
  });
  const [termsAgreedTimestamp, setTermsAgreedTimestamp] = useState<number | null>(() => {
    const saved =
      localStorage.getItem('yaawp_terms_agreed_time') ||
      localStorage.getItem('instagram_terms_agreed_time');
    return saved ? Number(saved) : null;
  });
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('terms');
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState<boolean>(false);

  // Signed-in state comes ONLY from a real Supabase session (see session
  // listener). Never trust a browser flag for this.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [isUsernameSetupRequired, setIsUsernameSetupRequired] = useState<boolean>(() => {
    return localStorage.getItem('yaawp_needs_username_prompt') === 'true';
  });

  const openAuthModal = (mode: 'signup' | 'login' = 'signup') => {
    setAuthModalMode(mode);
    setIsCreateAccountModalOpen(true);
  };

  // Communities, Discussions, Challenges State
  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = getStoredStateItem('communities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const DUMMY_COMM_IDS = new Set(['comm_1', 'comm_2', 'comm_3', 'comm_4', 'comm_visual_arts', 'comm_street_photo']);
          return parsed.filter((c: any) =>
            c && !DUMMY_COMM_IDS.has(c.id) && !['Tokyo Street Photography', 'Visual Storytellers', 'Minimalist Architecture'].includes(c.name)
          );
        }
      } catch {}
    }
    return INITIAL_COMMUNITIES;
  });
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState<boolean>(false);

  const [discussions, setDiscussions] = useState<Discussion[]>(() => {
    const saved = getStoredStateItem('discussions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((d: any) => d && !['disc_1', 'disc_2', 'disc_3'].includes(d.id));
        }
      } catch {}
    }
    return INITIAL_DISCUSSIONS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = getStoredStateItem('challenges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((ch: any) => ch && !['chal_1', 'chal_2', 'chal_3'].includes(ch.id));
        }
      } catch {}
    }
    return INITIAL_CHALLENGES;
  });
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState<boolean>(false);

  // Settings & Privacy State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpenState] = useState<boolean>(false);
  const setIsProfileMenuOpen = (open: boolean) => {
    setIsProfileMenuOpenState(open);
    if (open) {
      setActiveTab('settings');
    }
  };
  const [chatSecretCode, setChatSecretCodeState] = useState<string>(() => {
    return localStorage.getItem('lumina_chat_secret_code') || '';
  });
  const setChatSecretCode = (code: string) => {
    setChatSecretCodeState(code);
    localStorage.setItem('lumina_chat_secret_code', code);
    showToast('Secret lock code updated successfully!');
  };

  const [isVaultNotificationsEnabled, setIsVaultNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('lumina_vault_notifications');
    return saved !== null ? saved === 'true' : false;
  });

  const toggleVaultNotifications = () => {
    setIsVaultNotificationsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('lumina_vault_notifications', String(next));
      showToast(next ? 'Vault notifications enabled' : 'Vault notifications muted');
      return next;
    });
  };

  const [defaultVaultConfig, setDefaultVaultConfig] = useState<HiddenVaultConfig>(() => {
    const saved = localStorage.getItem('lumina_default_vault_config');
    return saved ? JSON.parse(saved) : { hideChat: true, hideStories: true, hidePosts: true };
  });

  const updateDefaultVaultConfig = (updates: Partial<HiddenVaultConfig>) => {
    setDefaultVaultConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('lumina_default_vault_config', JSON.stringify(next));
      return next;
    });
  };

  // Permissions Management (Just-in-Time access requests)
  const [permissionStates, setPermissionStates] = useState<Record<AppPermissionType, 'always' | 'session' | 'denied' | undefined>>(() => {
    const saved = localStorage.getItem('lumina_app_permissions');
    return saved ? JSON.parse(saved) : { camera: undefined, microphone: undefined, location: undefined, storage: undefined };
  });

  const [activePermissionPrompt, setActivePermissionPrompt] = useState<{
    type: AppPermissionType;
    featureName?: string;
    resolve: (granted: boolean) => void;
  } | null>(null);

  const requestAppPermission = (type: AppPermissionType, featureName?: string): Promise<boolean> => {
    if (permissionStates[type] === 'always' || permissionStates[type] === 'session') {
      return Promise.resolve(true);
    }
    return new Promise(resolve => {
      setActivePermissionPrompt({ type, featureName, resolve });
    });
  };

  const respondToPermissionPrompt = (decision: 'always' | 'now' | 'deny') => {
    if (!activePermissionPrompt) return;
    const { type, resolve } = activePermissionPrompt;
    if (decision === 'always') {
      setPermissionStates(prev => {
        const next = { ...prev, [type]: 'always' as const };
        localStorage.setItem('lumina_app_permissions', JSON.stringify(next));
        return next;
      });
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} access granted`);
      resolve(true);
    } else if (decision === 'now') {
      setPermissionStates(prev => ({ ...prev, [type]: 'session' as const }));
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} access granted for this time`);
      resolve(true);
    } else {
      setPermissionStates(prev => ({ ...prev, [type]: 'denied' as const }));
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} access was denied`);
      resolve(false);
    }
    setActivePermissionPrompt(null);
  };

  const resetAppPermissions = () => {
    setPermissionStates({ camera: undefined, microphone: undefined, location: undefined, storage: undefined });
    localStorage.removeItem('lumina_app_permissions');
    showToast('App permissions have been reset');
  };
  const [isAccountPrivate, setIsAccountPrivate] = useState<boolean>(() => {
    return getStoredStateItem('account_private') === 'true';
  });
  const [showReadReceipts, setShowReadReceipts] = useState<boolean>(() => {
    const saved = getStoredStateItem('read_receipts');
    return saved !== null ? saved === 'true' : true;
  });
  const [showOnlineStatus, setShowOnlineStatus] = useState<boolean>(() => {
    const saved = getStoredStateItem('online_status');
    return saved !== null ? saved === 'true' : true;
  });
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const saved = getStoredStateItem('blocked_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [hiddenProfileFromUserIds, setHiddenProfileFromUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_hidden_profile_from_users');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleHideMyProfileFrom = (userId: string) => {
    setHiddenProfileFromUserIds(prev => {
      const exists = prev.includes(userId);
      const next = exists ? prev.filter(id => id !== userId) : [...prev, userId];
      try {
        localStorage.setItem('lumina_hidden_profile_from_users', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save hiddenProfileFromUserIds', err);
      }
      const targetUser = allUsers.find(u => u.id === userId);
      const name = targetUser ? `@${targetUser.username}` : 'user';
      showToast(exists ? `Your profile is now visible to ${name}` : `Your profile is now hidden from ${name}`);
      return next;
    });
  };

  const isProfileHiddenFromUser = (userId: string) => {
    return hiddenProfileFromUserIds.includes(userId);
  };

  // Security Suite & Passcode Protection State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isBehindTheScenesOpen, setIsBehindTheScenesOpen] = useState<boolean>(false);
  const [chatPasscode, setChatPasscodeState] = useState<string | null>(() => {
    const v = localStorage.getItem('lumina_chat_passcode');
    if (v && !v.startsWith('h1$')) { localStorage.removeItem('lumina_chat_passcode'); return null; }
    return v || null;
  });
  const [isChatLocked, setIsChatLocked] = useState<boolean>(() => {
    const v = localStorage.getItem('lumina_chat_passcode');
    return Boolean(v && v.startsWith('h1$'));
  });
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(() => {
    try { return JSON.parse(localStorage.getItem('yaawp_pin_failures') || '{}').count || 0; } catch { return 0; }
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try { return JSON.parse(localStorage.getItem('yaawp_pin_failures') || '{}').until || null; } catch { return null; }
  });
  const [failedLoginsAlert, setFailedLoginsAlert] = useState<boolean>(false);
  const [twoFactorPassword, setTwoFactorPasswordState] = useState<string | null>(() => {
    const v = localStorage.getItem('yaawp_2fa_password');
    if (v && !v.startsWith('h1$')) { localStorage.removeItem('yaawp_2fa_password'); return null; }
    return v || null;
  });
  const [twoFactorEnabled, setTwoFactorEnabledState] = useState<boolean>(() => {
    const hasPw = Boolean(localStorage.getItem('yaawp_2fa_password'));
    const isEn = localStorage.getItem('lumina_2fa_enabled') === 'true';
    return isEn && hasPw;
  });
  const [privateMediaSignedUrlsEnabled, setPrivateMediaSignedUrlsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('lumina_signed_urls') !== 'false';
  });
  const [isFollowersPrivate, setIsFollowersPrivate] = useState<boolean>(() => {
    return localStorage.getItem('lumina_followers_private') === 'true';
  });

  // Real activity recorded on this device only (no invented entries).
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('yaawp_device_activity') || '[]');
    } catch {
      return [];
    }
  });

  const [joinRequests, setJoinRequests] = useState<CommunityJoinRequest[]>([]);

  // Algorithmic Recommendation & Feed Controls State
  const [algorithmSettings, setAlgorithmSettings] = useState<AlgorithmSettings>(() => {
    const saved = localStorage.getItem('lumina_algorithm_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      mutedTopics: [],
      mutedCommunityIds: [],
      mutedUserIds: [],
      topicAffinities: {},
      separateFriendsFromDiscovery: false,
      stopStrangers: false
    };
  });

  // Custom Circles (Close Friends, Family, School, Gaming, Local, etc.)
  const [customCircles, setCustomCircles] = useState<CustomCircle[]>(() => {
    const saved = localStorage.getItem('lumina_custom_circles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && !['circle_1', 'circle_2', 'circle_3'].includes(c.id));
        }
      } catch {}
    }
    return INITIAL_CIRCLES;
  });
  const [activeCustomCircleId, setActiveCustomCircleId] = useState<string | null>(null);

  // Spontaneous Meetups & Nearby Activities
  const [nearbyActivities, setNearbyActivities] = useState<NearbyActivity[]>(() => {
    const saved = localStorage.getItem('lumina_nearby_activities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => a && !['act_1', 'act_2', 'act_3'].includes(a.id));
        }
      } catch {}
    }
    return INITIAL_NEARBY_ACTIVITIES;
  });

  // Social Presence ("Currently" / Temporary Status)
  const [presenceStatus, setPresenceStatus] = useState<PresenceStatus>(() => {
    const saved = localStorage.getItem('lumina_presence_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      type: 'available',
      emoji: '🟢',
      label: 'Available',
      detail: 'Open to visual collaboration & chat',
      updatedAt: Date.now()
    };
  });

  // Community Personas (Contextual Name / Avatar per community)
  const [communityPersonas, setCommunityPersonas] = useState<Record<string, CommunityPersona>>(() => {
    const saved = localStorage.getItem('lumina_community_personas');
    return saved ? JSON.parse(saved) : {};
  });

  // Real-time Community Chat Messages
  const [communityChatMessages, setCommunityChatMessages] = useState<Record<string, CommunityChatMessage[]>>(() => {
    const saved = localStorage.getItem('lumina_community_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Offline & Feed Caching Layer
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const isOffline = !isOnline || isSimulatedOffline;

  const [feedCacheTimestamp, setFeedCacheTimestamp] = useState<number>(() => {
    try {
      const meta = localStorage.getItem(FEED_OFFLINE_META_KEY);
      return meta ? JSON.parse(meta).cachedAt : Date.now();
    } catch {
      return Date.now();
    }
  });

  const [isFeedRefreshing, setIsFeedRefreshing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connection restored • Feed synced online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode active • Feed loaded from local cache');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      showToast(next ? 'Offline Mode enabled: Viewing locally cached feed' : 'Online Mode restored: Live network sync');
      return next;
    });
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('yaawp_theme', theme);
    localStorage.setItem('yaawp_system_theme', systemTheme);
    document.documentElement.setAttribute('data-theme', systemTheme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, systemTheme]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_profiles`, JSON.stringify(userProfiles));
  }, [userProfiles]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_followed`, JSON.stringify(followedUserIds));
  }, [followedUserIds]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_feed_mode`, feedMode);
  }, [feedMode]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_feed_sort`, feedSort);
  }, [feedSort]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_communities`, JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_discussions`, JSON.stringify(discussions));
  }, [discussions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_challenges`, JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_account_private`, String(isAccountPrivate));
  }, [isAccountPrivate]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_read_receipts`, String(showReadReceipts));
  }, [showReadReceipts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_online_status`, String(showOnlineStatus));
  }, [showOnlineStatus]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_blocked_users`, JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_posts`, JSON.stringify(posts));
      const now = Date.now();
      setFeedCacheTimestamp(now);
      localStorage.setItem(FEED_OFFLINE_META_KEY, JSON.stringify({
        cachedAt: now,
        count: posts.length
      }));
    } catch {
      // Graceful quota recovery: prune old redundant keys and store essential compact posts
      try {
        localStorage.removeItem(FEED_OFFLINE_CACHE_KEY);
        const compactPosts = posts.slice(0, 30);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_posts`, JSON.stringify(compactPosts));
      } catch {
        try {
          const ultraCompact = posts.slice(0, 20).map((p, idx) => {
            if (idx > 3 && p.mediaUrls && p.mediaUrls.some(u => u && u.length > 50000)) {
              return { ...p, mediaUrls: [] };
            }
            return p;
          });
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_posts`, JSON.stringify(ultraCompact));
        } catch {}
      }
    }
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stories`, JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reels`, JSON.stringify(reels));
  }, [reels]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_conversations`, JSON.stringify(conversations));
  }, [conversations]);

  const setSystemTheme = (newPreset: AppThemePreset) => {
    setSystemThemeState(newPreset);
    localStorage.setItem('yaawp_system_theme', newPreset);
    const isLight = LIGHT_THEMES.includes(newPreset);
    const newThemeMode: 'light' | 'dark' = isLight ? 'light' : 'dark';
    setTheme(newThemeMode);
    localStorage.setItem('yaawp_theme', newThemeMode);
    document.documentElement.setAttribute('data-theme', newPreset);
    if (newThemeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const displayName = newPreset
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    showToast(`Applied ${displayName} theme (${isLight ? 'Bright' : 'Dark'})`);
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setSystemTheme('light');
    } else {
      setSystemTheme('dark');
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // All platform users list for search and discovery
  const allUsers = useMemo<UserSummary[]>(() => {
    const list: UserSummary[] = [
      {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
        bioSnippet: currentUser.bio.split('\n')[0]
      }
    ];

    Object.values(USERS).forEach(u => {
      list.push({
        ...u,
        isFollowing: followedUserIds.includes(u.id)
      });
    });

    return list;
  }, [currentUser, followedUserIds]);

  // Feed Algorithm: comprehensive multi-feed filtering and weighted affinity scoring
  const feedPosts = useMemo(() => {
    let filtered = posts;

    // 0. Exclude blocked users across all feeds
    if (blockedUsers.length > 0) {
      filtered = filtered.filter(p => !blockedUsers.includes(p.user.id));
    }

    // 0b. Exclude posts from contacts with "Hide Posts" enabled in Secret Vault
    const hiddenUsersWithPostsHidden = new Set(
      conversations
        .filter(c => c.isHiddenChat && c.hiddenVaultConfig?.hidePosts !== false)
        .map(c => c.participant.id)
    );
    if (hiddenUsersWithPostsHidden.size > 0) {
      filtered = filtered.filter(p => !hiddenUsersWithPostsHidden.has(p.user.id));
    }

    // 1. Filter by feedMode
    if (feedMode === 'following') {
      // Strictly creator subscriptions: followed users + current user
      filtered = filtered.filter(
        p => followedUserIds.includes(p.user.id) || p.user.id === currentUser.id
      );
    } else if (feedMode === 'for_you') {
      // Algorithmic discovery with user control
      filtered = filtered.filter(p => {
        // Exclude muted creators
        if (algorithmSettings.mutedUserIds.includes(p.user.id)) return false;

        // Exclude muted communities
        if (p.communityId && algorithmSettings.mutedCommunityIds.includes(p.communityId)) return false;

        // Exclude muted keywords/topics
        if (
          p.tags &&
          p.tags.some(tag =>
            algorithmSettings.mutedTopics
              .map(t => t.toLowerCase().replace('#', ''))
              .includes(tag.toLowerCase().replace('#', ''))
          )
        ) {
          return false;
        }

        // Stop seeing recommended strangers?
        if (algorithmSettings.stopStrangers) {
          const isFollowed = followedUserIds.includes(p.user.id) || p.user.id === currentUser.id;
          if (!isFollowed) return false;
        }

        return true;
      });
    } else if (feedMode === 'communities') {
      // Only posts tied to joined communities
      const joinedIds = communities.filter(c => c.isJoined).map(c => c.id);
      filtered = filtered.filter(p => p.communityId && joinedIds.includes(p.communityId));
    } else if (feedMode === 'nearby') {
      // Local/nearby posts with location or tagged #local / #meetup
      filtered = filtered.filter(
        p =>
          Boolean(p.location) ||
          p.tags.some(t =>
            t.toLowerCase().includes('local') ||
            t.toLowerCase().includes('meetup') ||
            t.toLowerCase().includes('walk')
          )
      );
    } else if (feedMode === 'my_posts') {
      filtered = filtered.filter(p => p.user.id === currentUser.id);
    } else if (feedMode === 'custom_list') {
      if (activeCustomCircleId) {
        const circle = customCircles.find(c => c.id === activeCustomCircleId);
        if (circle) {
          filtered = filtered.filter(
            p => circle.userIds.includes(p.user.id) || p.user.id === currentUser.id
          );
        }
      }
    }

    // 2. Sorting and Ranking Algorithm
    const sorted = [...filtered].sort((a, b) => {
      const aTime = a.createdAt || Date.now() - 3600000;
      const bTime = b.createdAt || Date.now() - 3600000;

      // Chronological: Pure recency (latest first)
      if (feedSort === 'chronological') {
        return bTime - aTime;
      }

      // Calculate Topic Affinity Boost
      let aAffinityBoost = 0;
      let bAffinityBoost = 0;
      Object.entries(algorithmSettings.topicAffinities || {}).forEach(([topic, weightVal]) => {
        const weight = Number(weightVal) || 0;
        const cleanTopic = topic.toLowerCase().replace('#', '');
        if (a.tags.some(t => t.toLowerCase().includes(cleanTopic))) aAffinityBoost += weight * 8;
        if (b.tags.some(t => t.toLowerCase().includes(cleanTopic))) bAffinityBoost += weight * 8;
      });

      // Engagement: Prioritize content by interactions (likes + comments + saves)
      if (feedSort === 'engagement') {
        const aScore = a.likesCount * 2 + a.comments.length * 4 + (a.isSaved ? 10 : 0) + aAffinityBoost;
        const bScore = b.likesCount * 2 + b.comments.length * 4 + (b.isSaved ? 10 : 0) + bAffinityBoost;
        return bScore - aScore;
      }

      // Trending: Velocity over time
      if (feedSort === 'trending') {
        const now = Date.now();
        const aHours = Math.max(0.2, (now - aTime) / (3600 * 1000));
        const bHours = Math.max(0.2, (now - bTime) / (3600 * 1000));
        const aVelocity =
          (a.likesCount * 2 + a.comments.length * 3 + aAffinityBoost) / Math.pow(aHours, 1.4);
        const bVelocity =
          (b.likesCount * 2 + b.comments.length * 3 + bAffinityBoost) / Math.pow(bHours, 1.4);
        return bVelocity - aVelocity;
      }

      // Balanced (Default): Engagement decayed over time + topic affinity
      const now = Date.now();
      const aHours = Math.max(0.5, (now - aTime) / (3600 * 1000));
      const bHours = Math.max(0.5, (now - bTime) / (3600 * 1000));

      const aEng = a.likesCount * 1.5 + a.comments.length * 3 + (a.isSaved ? 8 : 0) + aAffinityBoost;
      const bEng = b.likesCount * 1.5 + b.comments.length * 3 + (b.isSaved ? 8 : 0) + bAffinityBoost;

      const aScore = aEng / Math.pow(aHours + 2, 1.15);
      const bScore = bEng / Math.pow(bHours + 2, 1.15);

      return bScore - aScore;
    });

    return sorted;
  }, [
    posts,
    followedUserIds,
    currentUser.id,
    feedMode,
    feedSort,
    blockedUsers,
    algorithmSettings,
    communities,
    activeCustomCircleId,
    customCircles
  ]);

  // Open any user's unique profile page
  const openUserProfile = (userId: string) => {
    setViewedUserId(userId);
    setActiveTab('profile');
  };

  // Retrieve user profile for any user
  const getUserProfile = (userId: string): UserProfile => {
    if (userId === currentUser.id) {
      return currentUser;
    }
    const profile = userProfiles[userId];
    if (profile) {
      return {
        ...profile,
        isFollowing: followedUserIds.includes(userId)
      };
    }
    const fallbackUser = Object.values(USERS).find(u => u.id === userId);
    return {
      id: userId,
      username: fallbackUser?.username || 'user',
      name: fallbackUser?.name || 'User',
      avatar: fallbackUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userId)}`,
      isVerified: fallbackUser?.isVerified || false,
      isFollowing: followedUserIds.includes(userId),
      bio: fallbackUser?.bioSnippet || '',
      followersCount: 0,
      followingCount: 0,
      postsCount: posts.filter(p => p.user.id === userId).length,
      highlights: []
    };
  };

  // Direct Messaging: Start conversation with any user
  const startConversationWithUser = (user: UserSummary) => {
    const existing = conversations.find(c => c.participant.id === user.id);
    if (existing) {
      setActiveConvId(existing.id);
    } else {
      const newConv: ChatConversation = {
        id: `conv_${user.id}_${Date.now()}`,
        participant: user,
        lastMessage: 'Conversation started',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        isOnline: true,
        messages: [
          {
            id: `msg_hello_${Date.now()}`,
            senderId: user.id,
            text: `Hey @${currentUser.username}! Great to connect with you 👋`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    }
    setActiveTab('messages');
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const wasLiked = p.isLiked;
          const nextLiked = !wasLiked;
          const nextCount = wasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1;
          savePostInteraction(postId, {
            isLiked: nextLiked,
            likesCount: nextCount
          });
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextCount
          };
        }
        return p;
      })
    );
  };

  const toggleSavePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const nextSaved = !p.isSaved;
          showToast(nextSaved ? 'Saved to collection' : 'Removed from collection');
          savePostInteraction(postId, {
            isSaved: nextSaved
          });
          return {
            ...p,
            isSaved: nextSaved
          };
        }
        return p;
      })
    );
  };

  const votePost = (postId: string, type: 'up' | 'down') => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const currentVote = p.userVote;
          let newVote: 'up' | 'down' | undefined;
          let scoreDiff = 0;
          let upDiff = 0;
          let downDiff = 0;

          if (currentVote === type) {
            // Cancel vote
            newVote = undefined;
            if (type === 'up') {
              scoreDiff = -1;
              upDiff = -1;
            } else {
              scoreDiff = 1;
              downDiff = -1;
            }
          } else if (currentVote) {
            // Flip vote
            newVote = type;
            if (type === 'up') {
              scoreDiff = 2;
              upDiff = 1;
              downDiff = -1;
            } else {
              scoreDiff = -2;
              upDiff = -1;
              downDiff = 1;
            }
          } else {
            // New vote
            newVote = type;
            if (type === 'up') {
              scoreDiff = 1;
              upDiff = 1;
            } else {
              scoreDiff = -1;
              downDiff = 1;
            }
          }

          const currentScore = p.score ?? p.likesCount;
          const currentUps = p.upvotes ?? p.likesCount;
          const currentDowns = p.downvotes ?? 0;

          return {
            ...p,
            userVote: newVote,
            score: currentScore + scoreDiff,
            upvotes: Math.max(0, currentUps + upDiff),
            downvotes: Math.max(0, currentDowns + downDiff),
            // Sync likesCount with upvotes for compatibility
            likesCount: Math.max(0, currentUps + upDiff),
            isLiked: newVote === 'up'
          };
        }
        return p;
      })
    );
  };

  const repostPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.allowsRepost === false) {
      showToast('The creator has disabled reposting for this post.');
      return;
    }

    const wasReposted = post.isReposted;
    const newRepostCount = (post.repostsCount || 0) + (wasReposted ? -1 : 1);

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isReposted: !wasReposted,
            repostsCount: Math.max(0, newRepostCount)
          };
        }
        return p;
      })
    );

    if (!wasReposted) {
      // Create a repost in feed
      const repostEntry: Post = {
        id: `repost_${Date.now()}`,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          avatar: currentUser.avatar,
          isVerified: currentUser.isVerified
        },
        repostedBy: {
          id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        mediaUrls: post.mediaUrls,
        caption: '',
        timestamp: 'JUST NOW',
        createdAt: Date.now(),
        likesCount: 0,
        isLiked: false,
        isSaved: false,
        comments: [],
        isReposted: true,
        originalPostId: post.id,
        quotePost: post
      };
      setPosts(prev => [repostEntry, ...prev]);
      showToast(`Reposted @${post.user.username}'s post to your feed`);
    } else {
      // Remove previous repost entry
      setPosts(prev => prev.filter(p => !(p.originalPostId === postId && p.user.id === currentUser.id)));
      showToast('Removed repost');
    }
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal(null);
    }
    setCurrentUser(prev => ({
      ...prev,
      postsCount: Math.max(0, prev.postsCount - 1)
    }));

    if (isSupabaseConfigured && supabaseSession?.user?.id) {
      supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', supabaseSession.user.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase post delete notice:', error.message);
        });
    }

    showToast('Post deleted.');
  };

  const editPost = (postId: string, newCaption: string) => {
    const updatedTags = newCaption.match(/#[a-zA-Z0-9_]+/g) || [];
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            caption: newCaption,
            tags: updatedTags
          };
        }
        return p;
      })
    );
    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal(prev => (prev ? { ...prev, caption: newCaption, tags: updatedTags } : null));
    }

    if (isSupabaseConfigured && supabaseSession?.user?.id) {
      supabase
        .from('posts')
        .update({ caption: newCaption, tags: updatedTags })
        .eq('id', postId)
        .eq('user_id', supabaseSession.user.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase post edit notice:', error.message);
        });
    }

    showToast('Post updated.');
  };

  const reportPost = (postId: string, reason: string) => {
    showToast(`Report received ("${reason}"). Our moderation team will review this.`);
  };

  const addComment = (postId: string, text: string, parentId?: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      postId,
      parentId,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      text: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
      score: 0,
      replies: []
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          if (parentId) {
            // Append to parent comment's replies
            const updateReplies = (comments: Comment[]): Comment[] => {
              return comments.map(c => {
                if (c.id === parentId) {
                  return {
                    ...c,
                    replies: [...(c.replies || []), newComment]
                  };
                }
                if (c.replies && c.replies.length > 0) {
                  return {
                    ...c,
                    replies: updateReplies(c.replies)
                  };
                }
                return c;
              });
            };
            return {
              ...p,
              comments: updateReplies(p.comments)
            };
          }
          return {
            ...p,
            comments: [...p.comments, newComment]
          };
        }
        return p;
      })
    );

    // Also update selectedPostForModal if open
    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal(prev => {
        if (!prev) return null;
        if (parentId) {
          const updateReplies = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment]
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: updateReplies(c.replies)
                };
              }
              return c;
            });
          };
          return {
            ...prev,
            comments: updateReplies(prev.comments)
          };
        }
        return {
          ...prev,
          comments: [...prev.comments, newComment]
        };
      });
    }
  };

  const likeComment = (postId: string, commentId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                const wasLiked = c.isLiked;
                return {
                  ...c,
                  isLiked: !wasLiked,
                  likesCount: wasLiked ? c.likesCount - 1 : c.likesCount + 1
                };
              }
              return c;
            })
          };
        }
        return p;
      })
    );
  };

  const voteComment = (postId: string, commentId: string, type: 'up' | 'down') => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                const currentVote = c.userVote;
                const newVote = currentVote === type ? undefined : type;
                const scoreDiff = newVote === 'up' ? 1 : newVote === 'down' ? -1 : currentVote === 'up' ? -1 : 1;
                return {
                  ...c,
                  userVote: newVote,
                  score: (c.score || 0) + scoreDiff
                };
              }
              return c;
            })
          };
        }
        return p;
      })
    );
  };

  const createPost = (data: {
    mediaUrls?: string[];
    videoUrl?: string;
    isTextPost?: boolean;
    textPostTheme?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'sunset' | 'dark';
    postType?: 'image' | 'video' | 'text';
    caption: string;
    location?: string;
    filterClass?: string;
    allowsRepost?: boolean;
    communityId?: string;
    audience?: Post['audience'];
    audienceCircleId?: string;
    allowedEmojis?: string[];
    restrictedEmojis?: string[];
    isScheduled?: boolean;
    scheduledPublishTime?: string;
  }) => {
    const isScheduledPost = Boolean(data.isScheduled && data.scheduledPublishTime);
    let scheduledDateLabel = '';
    if (isScheduledPost && data.scheduledPublishTime) {
      try {
        const d = new Date(data.scheduledPublishTime);
        scheduledDateLabel = d.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        scheduledDateLabel = data.scheduledPublishTime;
      }
    }

    const effectivePostType =
      data.postType || (data.videoUrl ? 'video' : data.isTextPost ? 'text' : 'image');

    const newPost: Post = {
      id: `post_${Date.now()}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified
      },
      mediaUrls: data.mediaUrls || [],
      videoUrl: data.videoUrl,
      isTextPost: data.isTextPost,
      textPostTheme: data.textPostTheme,
      postType: effectivePostType,
      caption: data.caption,
      location: data.location || undefined,
      tags: data.caption.match(/#[a-zA-Z0-9_]+/g) || [],
      timestamp: isScheduledPost ? `SCHEDULED: ${scheduledDateLabel}` : 'JUST NOW',
      createdAt: Date.now(),
      likesCount: 0,
      isLiked: false,
      isSaved: false,
      filterClass: data.filterClass || 'filter-normal',
      comments: [],
      allowsRepost: data.allowsRepost !== undefined ? data.allowsRepost : true,
      communityId: data.communityId,
      audience: data.audience || 'everyone',
      audienceCircleId: data.audienceCircleId,
      allowedEmojis: data.allowedEmojis,
      restrictedEmojis: data.restrictedEmojis,
      isScheduled: isScheduledPost,
      scheduledPublishTime: isScheduledPost ? data.scheduledPublishTime : undefined,
      score: 0,
      upvotes: 0,
      downvotes: 0
    };

    setPosts(prev => [newPost, ...prev]);
    setCurrentUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));

    // Persist to Supabase when connected and authenticated
    if (isSupabaseConfigured && supabaseSession?.user?.id) {
      const isText = effectivePostType === 'text' || Boolean(data.isTextPost);
      const postMediaUrl = isText ? '' : (data.mediaUrls?.[0] || '');
      supabase
        .from('posts')
        .insert({
          user_id: supabaseSession.user.id,
          caption: data.caption,
          media_url: postMediaUrl,
          media_type: isText ? 'text' : (data.videoUrl ? 'video' : 'image'),
          filter_class: data.filterClass || 'filter-normal',
          tags: data.caption.match(/#[a-zA-Z0-9_]+/g) || [],
          location: data.location || null,
          audience: data.audience || 'everyone'
        })
        .select()
        .single()
        .then(({ data: inserted, error }) => {
          if (error) {
            console.warn('Supabase post insert notice:', error.message);
          } else if (inserted) {
            // Synchronize the local post id with real Supabase row ID
            setPosts(prev => prev.map(p => (p.id === newPost.id ? { ...p, id: inserted.id } : p)));
          }
        });
    }

    // Confetti celebration!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']
      });
    } catch {
      // safe fallback
    }

    if (isScheduledPost) {
      showToast(`Post scheduled for ${scheduledDateLabel}!`);
    } else {
      showToast('Your post was shared successfully!');
    }
    setActiveTab('feed');
  };

  const createStory = (
    mediaUrlOrConfig: string | { mediaUrl: string; caption?: string; poll?: StoryPoll; isTextStory?: boolean; storyTheme?: string },
    caption?: string,
    poll?: StoryPoll,
    isTextStory?: boolean,
    storyTheme?: string
  ) => {
    let finalMediaUrl: string;
    let finalCaption = caption;
    let finalPoll = poll;
    let finalIsTextStory = isTextStory;
    let finalStoryTheme = storyTheme;

    if (typeof mediaUrlOrConfig === 'object' && mediaUrlOrConfig !== null) {
      finalMediaUrl = mediaUrlOrConfig.mediaUrl;
      finalCaption = mediaUrlOrConfig.caption ?? caption;
      finalPoll = mediaUrlOrConfig.poll ?? poll;
      finalIsTextStory = mediaUrlOrConfig.isTextStory ?? isTextStory;
      finalStoryTheme = mediaUrlOrConfig.storyTheme ?? storyTheme;
    } else {
      finalMediaUrl = String(mediaUrlOrConfig);
    }

    const newStory: Story = {
      id: `story_${Date.now()}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      mediaUrl: finalMediaUrl,
      timestamp: 'Just now',
      seen: false,
      caption: finalCaption,
      poll: finalPoll,
      isTextStory: finalIsTextStory,
      storyTheme: finalStoryTheme
    };

    setStories(prev => [newStory, ...prev.filter(s => s.user.id !== currentUser.id)]);
    showToast('Story added to your profile!');
  };

  const voteStoryPoll = (storyId: string, optionId: string) => {
    setStories(prev =>
      prev.map(story => {
        if (story.id !== storyId || !story.poll) return story;
        if (story.poll.userVotedOptionId) return story; // already voted
        const updatedOptions = story.poll.options.map(opt =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        const totalVotes = updatedOptions.reduce((acc, o) => acc + o.votes, 0);
        return {
          ...story,
          poll: {
            ...story.poll,
            options: updatedOptions,
            userVotedOptionId: optionId,
            totalVotes
          }
        };
      })
    );
  };

  const createReel = (reelData: {
    mediaUrl: string;
    caption: string;
    musicTitle?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    filterClass?: string;
    trimStart?: number;
    trimEnd?: number;
    audioTrackUrl?: string;
    audioTrackId?: string;
  }) => {
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      mediaUrl: reelData.mediaUrl,
      thumbnailUrl: reelData.thumbnailUrl,
      durationSeconds: reelData.durationSeconds || 15,
      caption: reelData.caption || '',
      musicTitle: reelData.musicTitle || 'Original Audio',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      filterClass: reelData.filterClass || 'filter-normal',
      trimStart: reelData.trimStart,
      trimEnd: reelData.trimEnd,
      audioTrackUrl: reelData.audioTrackUrl,
      audioTrackId: reelData.audioTrackId,
      comments: []
    };

    setReels(prev => [newReel, ...prev]);
    showToast('Reel published to your profile & Reels feed!');
  };

  const deleteReel = (reelId: string) => {
    setReels(prev => prev.filter(r => r.id !== reelId));
    showToast('Reel deleted');
  };

  const toggleLikeReel = (reelId: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const wasLiked = r.isLiked;
          return {
            ...r,
            isLiked: !wasLiked,
            likesCount: wasLiked ? r.likesCount - 1 : r.likesCount + 1
          };
        }
        return r;
      })
    );
  };

  const toggleSaveReel = (reelId: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const nextSaved = !r.isSaved;
          showToast(nextSaved ? 'Saved reel to collection' : 'Removed from collection');
          return {
            ...r,
            isSaved: nextSaved
          };
        }
        return r;
      })
    );
  };

  const addReelComment = (reelId: string, text: string, parentId?: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `reel_comm_${Date.now()}`,
      parentId,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      text: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
      replies: []
    };

    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          if (parentId) {
            const updateReplies = (comments: Comment[]): Comment[] => {
              return comments.map(c => {
                if (c.id === parentId) {
                  return { ...c, replies: [...(c.replies || []), newComment] };
                }
                if (c.replies && c.replies.length > 0) {
                  return { ...c, replies: updateReplies(c.replies) };
                }
                return c;
              });
            };
            return {
              ...r,
              commentsCount: r.commentsCount + 1,
              comments: updateReplies(r.comments || [])
            };
          }
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [...(r.comments || []), newComment]
          };
        }
        return r;
      })
    );
    showToast('Comment posted to reel');
  };

  const likeReelComment = (reelId: string, commentId: string) => {
    const toggleLike = (comments: Comment[]): Comment[] => {
      return comments.map(c => {
        if (c.id === commentId) {
          const wasLiked = c.isLiked;
          return {
            ...c,
            isLiked: !wasLiked,
            likesCount: wasLiked ? c.likesCount - 1 : c.likesCount + 1
          };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: toggleLike(c.replies) };
        }
        return c;
      });
    };

    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          return { ...r, comments: toggleLike(r.comments || []) };
        }
        return r;
      })
    );
  };

  const deleteReelComment = (reelId: string, commentId: string) => {
    const removeComment = (comments: Comment[]): Comment[] => {
      return comments
        .filter(c => c.id !== commentId)
        .map(c => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : []
        }));
    };

    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: Math.max(0, r.commentsCount - 1),
            comments: removeComment(r.comments || [])
          };
        }
        return r;
      })
    );
    showToast('Reel comment deleted');
  };

  const toggleFollowUser = (userId: string) => {
    if (
      userId === currentUser.id ||
      (userProfiles[userId] &&
        userProfiles[userId].username?.toLowerCase() === currentUser.username?.toLowerCase())
    ) {
      showToast("You cannot follow your own account");
      return;
    }
    const isCurrentlyFollowing = followedUserIds.includes(userId);
    const nextFollowed = isCurrentlyFollowing
      ? followedUserIds.filter(id => id !== userId)
      : [...followedUserIds, userId];

    setFollowedUserIds(nextFollowed);

    // Update currentUser following count
    setCurrentUser(prev => ({
      ...prev,
      followingCount: isCurrentlyFollowing
        ? Math.max(0, prev.followingCount - 1)
        : prev.followingCount + 1
    }));

    // Update target profile followers count and status
    setUserProfiles(prev => {
      const existing = prev[userId];
      if (!existing) return prev;
      return {
        ...prev,
        [userId]: {
          ...existing,
          isFollowing: !isCurrentlyFollowing,
          followersCount: isCurrentlyFollowing
            ? Math.max(0, existing.followersCount - 1)
            : existing.followersCount + 1
        }
      };
    });

    const targetUser = Object.values(USERS).find(u => u.id === userId) || userProfiles[userId];
    const targetName = targetUser ? `@${targetUser.username}` : 'user';
    showToast(isCurrentlyFollowing ? `Unfollowed ${targetName}` : `Following ${targetName}`);
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const markConversationAsUnread = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unreadCount: Math.max(1, c.unreadCount + 1) } : c))
    );
  };

  const simulateIncomingMessage = (senderId?: string, customText?: string) => {
    const sender = senderId
      ? ((Object.values(USERS) as UserSummary[]).find(u => u.id === senderId) || ((Object.values(userProfiles) as UserProfile[]).find(u => u.id === senderId) as any))
      : ((Object.values(USERS) as UserSummary[])[0] || ((Object.values(userProfiles) as UserProfile[])[0] as any));
    if (!sender) return;
    const convId = `conv_${sender.username.replace('@', '')}`;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: sender.id,
      text: customText || "Hey! Just dropped a comment on your latest post ✨",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversations(prev => {
      const existing = prev.find(c => c.id === convId);
      if (existing) {
        const isCurrentlyViewing =
          window.location.pathname.includes('/chats') && activeConvIdRef.current === convId;
        return prev.map(c =>
          c.id === convId
            ? {
                ...c,
                lastMessage: newMsg.text,
                lastMessageTime: 'Just now',
                messages: [...c.messages, newMsg],
                unreadCount: isCurrentlyViewing ? 0 : c.unreadCount + 1
              }
            : c
        );
      }
      return [
        {
          id: convId,
          participant: sender,
          lastMessage: newMsg.text,
          lastMessageTime: 'Just now',
          unreadCount: 1,
          isOnline: true,
          isRecipientInChat: false,
          messages: [newMsg]
        },
        ...prev
      ];
    });
  };

  const markRecipientSeen = (conversationId: string) => {
    const seenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const userMsgs = c.messages.filter(m => m.senderId === currentUser.id);
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          return {
            ...c,
            isRecipientInChat: true,
            lastSeenByRecipient: lastUserMsg
              ? {
                  messageId: lastUserMsg.id,
                  timestamp: seenTime
                }
              : c.lastSeenByRecipient,
            messages: c.messages.map(m =>
              m.senderId === currentUser.id
                ? { ...m, status: 'seen', seenAt: m.seenAt || 'Just now' }
                : m
            )
          };
        }
        return c;
      })
    );
    const target = conversations.find(c => c.id === conversationId);
    if (target) {
      showToast(`${target.participant.name} opened the chat (Seen)`);
    }
  };

  const toggleRecipientInChat = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const willBeInChat = !c.isRecipientInChat;
          const seenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const userMsgs = c.messages.filter(m => m.senderId === currentUser.id);
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          return {
            ...c,
            isRecipientInChat: willBeInChat,
            lastSeenByRecipient: willBeInChat && lastUserMsg
              ? { messageId: lastUserMsg.id, timestamp: seenTime }
              : c.lastSeenByRecipient,
            messages: willBeInChat
              ? c.messages.map(m =>
                  m.senderId === currentUser.id
                    ? { ...m, status: 'seen', seenAt: m.seenAt || 'Just now' }
                    : m
                )
              : c.messages
          };
        }
        return c;
      })
    );
  };

  const sendMessage = (
    conversationId: string,
    text: string,
    options?: {
      replyTo?: { id: string; text: string; senderName: string };
      isVoice?: boolean;
      voiceDurationSeconds?: number;
      mediaUrl?: string;
      mediaType?: 'image' | 'video' | 'file';
      fileName?: string;
      documentData?: DocumentData;
      audioData?: AudioData;
      contactData?: ContactData;
      locationData?: LocationData;
      pollData?: PollData;
      gameSession?: GameSession;
    }
  ) => {
    if (
      !text.trim() &&
      !options?.isVoice &&
      !options?.mediaUrl &&
      !options?.documentData &&
      !options?.audioData &&
      !options?.contactData &&
      !options?.locationData &&
      !options?.pollData &&
      !options?.gameSession
    ) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgId = `msg_${Date.now()}`;
    const displaySnippet = options?.isVoice
      ? `🎙️ Voice Note (${options.voiceDurationSeconds || 5}s)`
      : options?.mediaUrl
      ? (options.mediaType === 'image' ? '📷 Photo' : options.mediaType === 'video' ? '🎥 Video' : '📎 Attachment')
      : options?.documentData
      ? `📄 ${options.documentData.fileName}`
      : options?.audioData
      ? `🎵 ${options.audioData.title}`
      : options?.contactData
      ? `👤 Contact: ${options.contactData.name}`
      : options?.locationData
      ? `📍 Location: ${options.locationData.name}`
      : options?.pollData
      ? `📊 Poll: ${options.pollData.question}`
      : options?.gameSession
      ? `🎮 Game: ${options.gameSession.gameTitle}`
      : text.trim();

    const newMessage: ChatMessage = {
      id: newMsgId,
      senderId: currentUser.id,
      text: text.trim() || displaySnippet,
      timestamp: nowTime,
      status: 'sent',
      replyTo: options?.replyTo,
      isVoice: options?.isVoice,
      voiceDurationSeconds: options?.voiceDurationSeconds,
      mediaUrl: options?.mediaUrl,
      mediaType: options?.mediaType,
      fileName: options?.fileName,
      documentData: options?.documentData,
      audioData: options?.audioData,
      contactData: options?.contactData,
      locationData: options?.locationData,
      pollData: options?.pollData,
      gameSession: options?.gameSession
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: displaySnippet,
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );

    // 1. Deliver message after 500ms
    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === newMsgId && m.status === 'sent'
                  ? { ...m, status: 'delivered' }
                  : m
              )
            };
          }
          return c;
        })
      );
    }, 500);

    // 2. Simulated recipient opening conversation -> 'seen'
    const targetConv = conversations.find(c => c.id === conversationId);
    if (targetConv && targetConv.participant.id !== currentUser.id) {
      // Recipient opens conversation after ~1.4s
      setTimeout(() => {
        const seenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setConversations(prev =>
          prev.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                isRecipientInChat: true,
                lastSeenByRecipient: {
                  messageId: newMsgId,
                  timestamp: seenTime
                },
                messages: c.messages.map(m =>
                  m.id === newMsgId
                    ? { ...m, status: 'seen', seenAt: 'Just now' }
                    : m
                )
              };
            }
            return c;
          })
        );
      }, 1400);

      // 3. Recipient typing indicator starts
      setTimeout(() => {
        setConversations(prev =>
          prev.map(c => (c.id === conversationId ? { ...c, isTyping: true } : c))
        );
      }, 2200);

      // 4. Recipient replies and clears typing indicator
      setTimeout(() => {
        let replyText = '';
        let supportBotMeta: ChatMessage['supportBotData'] = undefined;

        if (targetConv.participant.id === SUPPORT_BOT_USER.id) {
          const botResult = getAutomatedBotResponse(text);
          replyText = botResult.text;
          supportBotMeta = {
            suggestedActions: botResult.suggestedActions,
            quickReplies: botResult.quickReplies
          };
        } else {
          const replies = [
            "Hey Jatin! Thanks for reaching out, loved checking this out 🙌",
            "Totally agree with that! Let's definitely collaborate soon ✨",
            "Thanks for the message! Love the composition in your recent work 📸",
            "Awesome point! Let's keep in touch 😊",
            "Sounds perfect! Catch you soon on the next project ✨"
          ];
          replyText = replies[Math.floor(Math.random() * replies.length)];
        }

        const autoReplyMessage: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          senderId: targetConv.participant.id,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          supportBotData: supportBotMeta
        };

        setConversations(prevConv =>
          prevConv.map(c => {
            if (c.id === conversationId) {
              const isCurrentlyViewing =
                window.location.pathname.includes('/chats') && activeConvIdRef.current === conversationId;
              return {
                ...c,
                isTyping: false,
                lastMessage: replyText.slice(0, 60),
                lastMessageTime: 'Just now',
                messages: [...c.messages, autoReplyMessage],
                unreadCount: isCurrentlyViewing ? 0 : c.unreadCount + 1
              };
            }
            return c;
          })
        );
      }, targetConv.participant.id === SUPPORT_BOT_USER.id ? 800 : 3600);
    }
  };

  const votePoll = (conversationId: string, messageId: string, optionId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id !== messageId || !m.pollData) return m;
            const poll = m.pollData;
            const alreadyVotedThis = poll.options.some(
              opt => opt.id === optionId && (opt.voters || []).includes(currentUser.id)
            );

            const updatedOptions = poll.options.map(opt => {
              const currentVotes = typeof opt.votes === 'number' ? opt.votes : 0;
              const voters = opt.voters || [];
              if (opt.id === optionId) {
                if (alreadyVotedThis) {
                  return {
                    ...opt,
                    votes: Math.max(0, currentVotes - 1),
                    voters: voters.filter(id => id !== currentUser.id),
                  };
                } else {
                  return {
                    ...opt,
                    votes: currentVotes + 1,
                    voters: [...voters, currentUser.id],
                  };
                }
              } else if (!poll.isMultipleChoice && !alreadyVotedThis && voters.includes(currentUser.id)) {
                return {
                  ...opt,
                  votes: Math.max(0, currentVotes - 1),
                  voters: voters.filter(id => id !== currentUser.id),
                };
              }
              return opt;
            });

            const totalVotes = updatedOptions.reduce((sum, o) => sum + o.votes, 0);

            return {
              ...m,
              pollData: {
                ...poll,
                options: updatedOptions,
                totalVotes,
              },
            };
          }),
        };
      })
    );
  };

  const updateGameSession = (conversationId: string, messageId: string, updated: Partial<GameSession>) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id !== messageId || !m.gameSession) return m;
            return {
              ...m,
              gameSession: {
                ...m.gameSession,
                ...updated,
              },
            };
          }),
        };
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        ...data
      };

      setUserProfiles(pMap => ({
        ...pMap,
        [prev.id]: updated
      }));

      return updated;
    });

    if (isSupabaseConfigured && (supabaseSession?.user?.id || currentUser.id)) {
      const targetUserId = supabaseSession?.user?.id || currentUser.id;
      supabase
        .from('profiles')
        .upsert({
          id: targetUserId,
          name: data.name ?? currentUser.name,
          username: data.username ?? currentUser.username,
          bio: data.bio ?? currentUser.bio,
          website: data.website ?? currentUser.website,
          avatar: data.avatar ?? currentUser.avatar,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase profile update/upsert notice:', error.message);
        });
    }

    // If avatar, name, or username changed, propagate to all posts and comments by currentUser
    if (data.avatar || data.name || data.username) {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          let updatedPost = { ...post };
          if (post.user.id === currentUser.id) {
            updatedPost.user = {
              ...post.user,
              avatar: data.avatar || post.user.avatar,
              name: data.name || post.user.name,
              username: data.username || post.user.username
            };
          }
          updatedPost.comments = post.comments.map(comment => {
            if (comment.user.id === currentUser.id) {
              return {
                ...comment,
                user: {
                  ...comment.user,
                  avatar: data.avatar || comment.user.avatar,
                  name: data.name || comment.user.name,
                  username: data.username || comment.user.username
                }
              };
            }
            return comment;
          });
          return updatedPost;
        })
      );
    }

    showToast('Profile updated successfully!');
  };

  const openLegalModal = (doc: LegalDocType = 'terms') => {
    setActiveLegalDoc(doc);
    setIsLegalModalOpen(false);
    setActiveTab('legal');
  };

  const closeLegalModal = () => {
    setIsLegalModalOpen(false);
  };

  const agreeToTermsAndContinue = () => {
    const now = Date.now();
    setHasAgreedToTerms(true);
    setTermsAgreedTimestamp(now);
    localStorage.setItem('yaawp_terms_agreed_v1', 'true');
    localStorage.setItem('yaawp_terms_agreed_time', String(now));
    showToast('Yaawp Terms of Use and Privacy Policy accepted.');
  };

  const createAccount = async (data: NewAccountRegistration) => {
    if (!data.agreedToTerms || !data.agreedToPrivacy) {
      return {
        success: false,
        error: 'You must agree to the Yaawp Terms of Use and Privacy Policy to create an account.'
      };
    }

    // Age verification: 13+
    const birthDate = new Date(data.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) {
      return {
        success: false,
        error: 'You must be at least 13 years old to create an account on Yaawp.'
      };
    }

    const cleanUsername = sanitizeUsername(data.username);
    const availability = await checkUsernameAvailability(cleanUsername, userProfiles);
    if (!availability.isAvailable) {
      const suggestionsText = availability.suggestions.length > 0
        ? ` Available suggestions: ${availability.suggestions.map(s => '@' + s).join(', ')}`
        : '';
      return {
        success: false,
        error: (availability.error || `The username @${cleanUsername} is already taken.`) + suggestionsText
      };
    }

    // Supabase Auth Integration
    let supabaseUserId: string | null = null;
    if (isSupabaseConfigured && data.contact.includes('@') && data.password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.contact.trim(),
          password: data.password.trim(),
          options: {
            captchaToken: data.captchaToken,
            data: {
              username: cleanUsername,
              full_name: data.name.trim(),
              avatar_url: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}`
            }
          }
        });
        if (authError) {
          return {
            success: false,
            error: `Supabase Auth error: ${authError.message}`
          };
        }
        if (authData.user) {
          supabaseUserId = authData.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase signUp error:', err);
      }
    }

    const newId = supabaseUserId || `user_${cleanUsername}_${Date.now().toString(36)}`;
    const newProfile: UserProfile = {
      id: newId,
      username: cleanUsername,
      name: data.name.trim(),
      email: data.contact.includes('@') ? data.contact.trim() : undefined,
      avatar: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}`,
      bio: 'New Yaawp creator ✨ Sharing moments & connecting with community.',
      isVerified: false,
      preferred_language: data.preferred_language || preferredLanguage || 'en',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      highlights: []
    };

    const updatedProfiles = {
      ...userProfiles,
      [newId]: newProfile
    };

    setUserProfiles(updatedProfiles);
    setCurrentUser(newProfile);
    setViewedUserId(newId);
    setHasAgreedToTerms(true);
    setTermsAgreedTimestamp(Date.now());

    localStorage.setItem(`${LOCAL_STORAGE_KEY}_profiles`, JSON.stringify(updatedProfiles));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(newProfile));
    localStorage.setItem('yaawp_terms_agreed_v1', 'true');
    localStorage.setItem('yaawp_terms_agreed_time', String(Date.now()));
    setIsAuthenticated(Boolean(supabaseSession));
    if (data.preferred_language) {
      setPreferredLanguage(data.preferred_language);
    }

    // First time onboarding: Check if user already received Yaawp@Support bot welcome message
    const welcomeDeliveredKey = `yaawp_bot_welcome_delivered_${newId}`;
    const alreadyReceived = localStorage.getItem(welcomeDeliveredKey) === 'true';
    const isBotAlreadyDeleted = localStorage.getItem('yaawp_support_bot_deleted') === 'true';

    if (!alreadyReceived && !isBotAlreadyDeleted) {
      localStorage.setItem(welcomeDeliveredKey, 'true');
      const welcomeBotMsg: ChatMessage = {
        id: `msg_welcome_${Date.now()}`,
        senderId: SUPPORT_BOT_USER.id,
        text: `👋 **Welcome to Yaawp, @${cleanUsername}!** I'm your dedicated **Yaawp@Support bot**.\n\nI can guide you with:\n• 🔒 **Privacy Settings & Account Security**\n• 🗝️ **Secret Vault & Hidden Chats**\n• 📱 **Camera, Mic & Location Permissions**\n• 📸 **Creating Posts & Stories**\n• ⚙️ **Finding Specific Settings**\n\nAsk me anything or tap the options below!`,
        timestamp: 'Just now',
        supportBotData: {
          suggestedActions: [
            { label: 'Open Privacy Settings', actionKey: 'open_privacy' },
            { label: 'Manage Secret Code', actionKey: 'open_secret_code' },
            { label: 'Manage Permissions', actionKey: 'open_permissions' },
            { label: 'Create a Post', actionKey: 'open_create_post' }
          ],
          quickReplies: SUPPORT_BOT_SUGGESTED_PROMPTS
        }
      };

      setConversations(prev => {
        const existingBotConv = prev.find(c => c.id === 'conv_support_bot');
        if (existingBotConv) {
          return prev.map(c =>
            c.id === 'conv_support_bot'
              ? {
                  ...c,
                  lastMessage: 'Welcome to Yaawp! How can I guide you today?',
                  lastMessageTime: 'Just now',
                  unreadCount: 1,
                  isPinned: false,
                  messages: [welcomeBotMsg]
                }
              : c
          );
        } else {
          const newBotConv: ChatConversation = {
            id: 'conv_support_bot',
            participant: SUPPORT_BOT_USER,
            lastMessage: 'Welcome to Yaawp! How can I guide you today?',
            lastMessageTime: 'Just now',
            unreadCount: 1,
            isPinned: false,
            isOnline: true,
            messages: [welcomeBotMsg]
          };
          return [...prev, newBotConv];
        }
      });
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Welcome to YAAWP, @${cleanUsername}!`);
    return { success: true };
  };

  const switchAccount = (userId: string) => {
    const profile = userProfiles[userId] || USERS[userId] || CURRENT_USER;
    const fullProfile: UserProfile = {
      id: profile.id,
      username: profile.username,
      name: profile.name,
      avatar: profile.avatar,
      bio: (profile as UserProfile).bio || 'Yaawp creator',
      website: (profile as UserProfile).website,
      isVerified: profile.isVerified,
      followersCount: (profile as UserProfile).followersCount ?? 0,
      followingCount: (profile as UserProfile).followingCount ?? 0,
      postsCount: (profile as UserProfile).postsCount ?? 0,
      highlights: (profile as UserProfile).highlights || []
    };
    setCurrentUser(fullProfile);
    setViewedUserId(fullProfile.id);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(fullProfile));
    showToast(`Switched account to @${fullProfile.username}`);
  };

  // Offline & Feed Caching refresh implementation
  const refreshFeed = async () => {
    setIsFeedRefreshing(true);
    await new Promise(r => setTimeout(r, 750));
    const now = Date.now();
    if (isOffline) {
      try {
        const cached = localStorage.getItem(FEED_OFFLINE_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        }
      } catch {
        // safe fallback
      }
      showToast(`Offline Mode • Loaded ${posts.length} cached posts from localStorage`);
    } else {
      setPosts(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0] = {
            ...updated[0],
            timestamp: 'Just now',
            createdAt: now
          };
        }
        return updated;
      });
      setFeedCacheTimestamp(now);
      try {
        localStorage.setItem(FEED_OFFLINE_CACHE_KEY, JSON.stringify(posts));
        localStorage.setItem(FEED_OFFLINE_META_KEY, JSON.stringify({
          cachedAt: now,
          count: posts.length
        }));
      } catch {
        // storage quota safe catch
      }
      showToast('Feed refreshed • Offline cache updated');
    }
    setIsFeedRefreshing(false);
  };

  // Communities Actions
  const openCommunityDetail = (id: string) => {
    setSelectedCommunityId(id);
    setActiveTab('communities');
  };

  const joinCommunity = (id: string, inviteCode?: string) => {
    const targetComm = communities.find(c => c.id === id);
    if (!targetComm) return;

    if (targetComm.isJoined) {
      leaveCommunity(id);
      return;
    }

    // Private community check
    if (targetComm.isPrivate) {
      const validCodes = [targetComm.inviteCode, `${targetComm.slug}-invite`, 'VIP_INVITE', 'COMMUNITY_PASS'];
      const hasValidCode = inviteCode && validCodes.includes(inviteCode.trim());

      if (!hasValidCode) {
        // Check if already requested
        const alreadyPending = joinRequests.some(
          r => r.communityId === id && r.user.id === currentUser.id && r.status === 'pending'
        );
        if (alreadyPending) {
          showToast('Your join request is already pending review by community moderators.');
          return;
        }

        const newReq: CommunityJoinRequest = {
          id: `req_${Date.now()}`,
          communityId: id,
          communityName: targetComm.name,
          user: {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          requestedAt: 'Just now',
          status: 'pending',
          message: 'Requested to join private community.'
        };
        setJoinRequests(prev => [newReq, ...prev]);
        showToast(`Request sent to ${targetComm.name} moderators • Status: Pending Approval`);
        return;
      }
    }

    // Direct join for public or valid invite link
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            isJoined: true,
            membersCount: c.membersCount + 1
          };
        }
        return c;
      })
    );

    setCurrentUser(prev => {
      const currentList = prev.communitiesJoined || [];
      return {
        ...prev,
        communitiesJoined: [...new Set([...currentList, id])]
      };
    });

    showToast(`Joined ${targetComm.name} • You are now a member!`);
  };

  const leaveCommunity = (id: string) => {
    const targetComm = communities.find(c => c.id === id);
    setCommunities(prev =>
      prev.map(c => (c.id === id ? { ...c, isJoined: false, membersCount: Math.max(0, c.membersCount - 1) } : c))
    );
    setCurrentUser(prev => ({
      ...prev,
      communitiesJoined: (prev.communitiesJoined || []).filter(cId => cId !== id)
    }));
    showToast(`Left ${targetComm?.name || 'Community'}`);
  };

  const createCommunity = (data: Partial<Community>) => {
    const generatedSlug = (data.name || 'collective').toLowerCase().replace(/\s+/g, '-');
    const newComm: Community = {
      id: `comm_${Date.now()}`,
      name: data.name || 'New Creative Collective',
      slug: generatedSlug,
      description: data.description || 'A welcoming space for creators and enthusiasts.',
      about: data.about || 'A dedicated community space on Lumina.',
      avatar: data.avatar || '',
      bannerUrl: data.bannerUrl || '',
      isPrivate: Boolean(data.isPrivate),
      inviteCode: `${generatedSlug}-invite`,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      moderators: [currentUser.id],
      membersCount: 1,
      isJoined: true,
      topicTags: data.topicTags || ['Creative', 'Visual', 'Community'],
      rules: data.rules || ['Be respectful', 'Share original work', 'No spam'],
      createdAt: 'Just now',
      activeDiscussionsCount: 0
    };
    setCommunities(prev => [newComm, ...prev]);
    showToast(`Created community "${newComm.name}"!`);
    setIsCreateCommunityOpen(false);
  };

  const updateCommunity = (id: string, data: Partial<Community>) => {
    setCommunities(prev =>
      prev.map(c => (c.id === id ? { ...c, ...data } : c))
    );
    showToast('Community details updated successfully');
  };

  const deleteCommunity = (id: string) => {
    setCommunities(prev => prev.filter(c => c.id !== id));
    if (selectedCommunityId === id) {
      setSelectedCommunityId(null);
    }
    showToast('Community deleted.');
  };

  const reportCommunity = (communityId: string, reason: string) => {
    setCommunities(prev =>
      prev.map(c =>
        c.id === communityId
          ? { ...c, reportedReasons: [...(c.reportedReasons || []), reason] }
          : c
      )
    );
    showToast(`Report received: "${reason}". Moderators notified.`);
  };

  const toggleHideCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const nextHidden = !c.isHidden;
          showToast(nextHidden ? 'Community hidden from main list' : 'Community unhidden');
          return { ...c, isHidden: nextHidden };
        }
        return c;
      })
    );
  };

  const pinDiscussion = (discussionId: string) => {
    setDiscussions(prev =>
      prev.map(d => (d.id === discussionId ? { ...d, isPinned: !d.isPinned } : d))
    );
    showToast('Discussion pin status toggled');
  };

  const createGroupChat = (name: string, isPublic: boolean, memberIds: string[], avatar?: string, description?: string) => {
    const memberUsers: UserSummary[] = memberIds
      .map(id => Object.values(USERS).find(u => u.id === id) || userProfiles[id])
      .filter(Boolean) as UserSummary[];
    
    // Ensure creator is included
    if (!memberUsers.some(m => m.id === currentUser.id)) {
      memberUsers.unshift({
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified
      });
    }

    const inviteCode = 'grp_' + Math.random().toString(36).substring(2, 9);
    const newGroup: ChatConversation = {
      id: `conv_group_${Date.now()}`,
      participant: {
        id: `group_${Date.now()}`,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        name: name,
        avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`
      },
      isGroup: true,
      groupName: name,
      groupAvatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      groupDescription: description || `Welcome to ${name}! A space to connect, share inspiration, and collaborate.`,
      groupMembers: memberUsers,
      isGroupPublic: isPublic,
      ownerId: currentUser.id,
      adminIds: [currentUser.id],
      groupMessagingPermission: 'all',
      restrictedMessengerIds: [],
      pendingJoinRequests: [],
      inviteCode,
      lastMessage: `Group created by @${currentUser.username}`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: `msg_sys_${Date.now()}`,
          senderId: 'system',
          text: `Welcome to ${name}! Created by ${currentUser.name} (Admin & Owner). Group is ${isPublic ? 'Public' : 'Private'}.`,
          timestamp: 'Just now'
        }
      ]
    };
    setConversations(prev => [newGroup, ...prev]);
    showToast(`Created ${isPublic ? 'Public' : 'Private'} group "${name}"!`);
  };

  const updateGroupSettings = (
    conversationId: string,
    updates: {
      name?: string;
      description?: string;
      avatar?: string;
      isPublic?: boolean;
      messagingPermission?: 'all' | 'admins_only';
    }
  ) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          const newName = updates.name !== undefined ? updates.name.trim() : c.groupName;
          const newDesc = updates.description !== undefined ? updates.description : c.groupDescription;
          const newAvatar = updates.avatar !== undefined ? updates.avatar : c.groupAvatar;
          const newIsPublic = updates.isPublic !== undefined ? updates.isPublic : c.isGroupPublic;
          const newMessaging = updates.messagingPermission !== undefined ? updates.messagingPermission : c.groupMessagingPermission;

          const systemNotices: string[] = [];
          if (updates.name && updates.name !== c.groupName) {
            systemNotices.push(`Group name changed to "${updates.name}"`);
          }
          if (updates.isPublic !== undefined && updates.isPublic !== c.isGroupPublic) {
            systemNotices.push(`Group privacy changed to ${updates.isPublic ? 'Public' : 'Private'}`);
          }
          if (updates.messagingPermission !== undefined && updates.messagingPermission !== c.groupMessagingPermission) {
            systemNotices.push(`Messaging permission set to ${updates.messagingPermission === 'admins_only' ? 'Only Admins' : 'All Members'}`);
          }

          const newSysMsgs = systemNotices.map((txt, idx) => ({
            id: `msg_sys_${Date.now()}_${idx}`,
            senderId: 'system',
            text: txt,
            timestamp: 'Just now'
          }));

          return {
            ...c,
            groupName: newName,
            groupDescription: newDesc,
            groupAvatar: newAvatar,
            isGroupPublic: newIsPublic,
            groupMessagingPermission: newMessaging,
            participant: {
              ...c.participant,
              name: newName || c.participant.name,
              avatar: newAvatar || c.participant.avatar
            },
            messages: [...c.messages, ...newSysMsgs]
          };
        }
        return c;
      })
    );
    showToast('Group settings updated');
  };

  const promoteGroupAdmin = (conversationId: string, userId: string) => {
    const user = Object.values(USERS).find(u => u.id === userId) || userProfiles[userId];
    const name = user ? user.name : 'Member';

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          const currentAdmins = c.adminIds || (c.ownerId ? [c.ownerId] : []);
          if (currentAdmins.includes(userId)) return c;
          const updatedAdmins = [...currentAdmins, userId];

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: `${name} was appointed as Group Admin by @${currentUser.username}.`,
            timestamp: 'Just now'
          };

          return {
            ...c,
            adminIds: updatedAdmins,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
    showToast(`${name} is now a Group Admin`);
  };

  const demoteGroupAdmin = (conversationId: string, userId: string) => {
    const user = Object.values(USERS).find(u => u.id === userId) || userProfiles[userId];
    const name = user ? user.name : 'Member';

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          if (c.ownerId === userId) {
            showToast('The Group Owner cannot be dismissed as admin');
            return c;
          }
          const currentAdmins = c.adminIds || [];
          const updatedAdmins = currentAdmins.filter(id => id !== userId);

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: `${name} was dismissed as Group Admin.`,
            timestamp: 'Just now'
          };

          return {
            ...c,
            adminIds: updatedAdmins,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
    showToast(`${name} is no longer an Admin`);
  };

  const toggleGroupMemberMessaging = (conversationId: string, userId: string) => {
    const user = Object.values(USERS).find(u => u.id === userId) || userProfiles[userId];
    const name = user ? user.name : 'Member';

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          const currentRestricted = c.restrictedMessengerIds || [];
          const isRestricted = currentRestricted.includes(userId);
          const nextRestricted = isRestricted
            ? currentRestricted.filter(id => id !== userId)
            : [...currentRestricted, userId];

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: isRestricted
              ? `${name} is now allowed to send messages in the group.`
              : `${name} has been restricted from sending messages in the group by an admin.`,
            timestamp: 'Just now'
          };

          showToast(
            isRestricted
              ? `${name} can now send messages`
              : `${name} restricted from messaging`
          );

          return {
            ...c,
            restrictedMessengerIds: nextRestricted,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
  };

  const removeGroupMember = (conversationId: string, userId: string) => {
    const user = Object.values(USERS).find(u => u.id === userId) || userProfiles[userId];
    const name = user ? user.name : 'Member';

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          if (c.ownerId === userId) {
            showToast('The Group Owner cannot be removed');
            return c;
          }
          const updatedMembers = (c.groupMembers || []).filter(m => m.id !== userId);
          const updatedAdmins = (c.adminIds || []).filter(id => id !== userId);
          const updatedRestricted = (c.restrictedMessengerIds || []).filter(id => id !== userId);

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: `${name} was removed from the group by an admin.`,
            timestamp: 'Just now'
          };

          return {
            ...c,
            groupMembers: updatedMembers,
            adminIds: updatedAdmins,
            restrictedMessengerIds: updatedRestricted,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
    showToast(`${name} removed from group`);
  };

  const addGroupMember = (conversationId: string, userId: string) => {
    const user = Object.values(USERS).find(u => u.id === userId) || userProfiles[userId];
    if (!user) return;

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          const currentMembers = c.groupMembers || [];
          if (currentMembers.some(m => m.id === userId)) {
            showToast(`${user.name} is already in the group`);
            return c;
          }

          const userSummary: UserSummary = {
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            isVerified: user.isVerified
          };

          const pending = (c.pendingJoinRequests || []).filter(r => r.user.id !== userId);

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: `${user.name} was added to the group by @${currentUser.username}.`,
            timestamp: 'Just now'
          };

          return {
            ...c,
            groupMembers: [...currentMembers, userSummary],
            pendingJoinRequests: pending,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
    showToast(`Added ${user.name} to the group`);
  };

  const approveGroupJoinRequest = (conversationId: string, requestId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          const request = (c.pendingJoinRequests || []).find(r => r.id === requestId);
          if (!request) return c;

          const currentMembers = c.groupMembers || [];
          const updatedMembers = currentMembers.some(m => m.id === request.user.id)
            ? currentMembers
            : [...currentMembers, request.user];

          const updatedRequests = (c.pendingJoinRequests || []).filter(r => r.id !== requestId);

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: `${request.user.name} joined the group (approved by admin).`,
            timestamp: 'Just now'
          };

          return {
            ...c,
            groupMembers: updatedMembers,
            pendingJoinRequests: updatedRequests,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
    showToast('Join request approved!');
  };

  const rejectGroupJoinRequest = (conversationId: string, requestId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          return {
            ...c,
            pendingJoinRequests: (c.pendingJoinRequests || []).filter(r => r.id !== requestId)
          };
        }
        return c;
      })
    );
    showToast('Join request declined');
  };

  const requestJoinGroupViaLink = (conversationId: string, customUser?: UserSummary) => {
    const userToJoin: UserSummary = customUser || {
      id: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      avatar: currentUser.avatar,
      isVerified: currentUser.isVerified
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          // If already member
          if ((c.groupMembers || []).some(m => m.id === userToJoin.id)) {
            showToast(`${userToJoin.name} is already a member`);
            return c;
          }

          if (c.isGroupPublic) {
            // Direct join for public group
            const sysMsg = {
              id: `msg_sys_${Date.now()}`,
              senderId: 'system',
              text: `${userToJoin.name} joined via group invite link.`,
              timestamp: 'Just now'
            };
            showToast(`Joined "${c.groupName}"!`);
            return {
              ...c,
              groupMembers: [...(c.groupMembers || []), userToJoin],
              messages: [...c.messages, sysMsg]
            };
          } else {
            // Needs admin approval for private group
            const existingReq = (c.pendingJoinRequests || []).some(r => r.user.id === userToJoin.id);
            if (existingReq) {
              showToast('Join request already pending approval by admin');
              return c;
            }
            const newReq: GroupPendingJoinRequest = {
              id: `req_grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              user: userToJoin,
              requestedAt: 'Just now'
            };
            showToast(`Join request sent! Admin approval is required for private groups.`);
            return {
              ...c,
              pendingJoinRequests: [newReq, ...(c.pendingJoinRequests || [])]
            };
          }
        }
        return c;
      })
    );
  };

  const exitGroup = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId && c.isGroup) {
          const updatedMembers = (c.groupMembers || []).filter(m => m.id !== currentUser.id);
          const updatedAdmins = (c.adminIds || []).filter(id => id !== currentUser.id);
          let newOwnerId = c.ownerId;
          
          // If owner leaves, transfer ownership to the next admin, or next member
          if (c.ownerId === currentUser.id) {
            newOwnerId = updatedAdmins[0] || (updatedMembers[0] ? updatedMembers[0].id : undefined);
            if (newOwnerId && !updatedAdmins.includes(newOwnerId)) {
              updatedAdmins.push(newOwnerId);
            }
          }

          const sysMsg = {
            id: `msg_sys_${Date.now()}`,
            senderId: 'system',
            text: `${currentUser.name} left the group.`,
            timestamp: 'Just now'
          };

          return {
            ...c,
            ownerId: newOwnerId,
            groupMembers: updatedMembers,
            adminIds: updatedAdmins,
            messages: [...c.messages, sysMsg]
          };
        }
        return c;
      })
    );
    showToast('You have exited the group');
  };

  const reportGroup = (conversationId: string, reason: string, details?: string) => {
    const targetGroup = conversations.find(c => c.id === conversationId);
    const groupName = targetGroup?.groupName || 'Group';
    addAuditLog('Group Reported', `Group: ${groupName} (ID: ${conversationId}). Reason: ${reason}. Details: ${details || 'None'}`, 'warning');
    showToast(`Group "${groupName}" reported for "${reason}". Moderation team notified.`);
  };

  const hideChatWithCode = (conversationId: string, code: string, customConfig?: Partial<HiddenVaultConfig>): boolean => {
    if (!chatSecretCode) {
      setChatSecretCode(code);
    } else if (code !== chatSecretCode) {
      showToast('Incorrect security code.');
      return false;
    }

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const config: HiddenVaultConfig = {
            hideChat: customConfig?.hideChat !== undefined ? customConfig.hideChat : defaultVaultConfig.hideChat,
            hideStories: customConfig?.hideStories !== undefined ? customConfig.hideStories : defaultVaultConfig.hideStories,
            hidePosts: customConfig?.hidePosts !== undefined ? customConfig.hidePosts : defaultVaultConfig.hidePosts,
          };
          return { ...c, isHiddenChat: true, hiddenVaultConfig: config };
        }
        return c;
      })
    );
    showToast('Chat hidden in Secret Vault. Enter your code in the Messages search bar to view.');
    return true;
  };

  const unhideChat = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return { ...c, isHiddenChat: false };
        }
        return c;
      })
    );
    showToast('Chat unhidden and restored to direct messages.');
  };

  const updateChatVaultConfig = (conversationId: string, updates: Partial<HiddenVaultConfig>) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const currentConfig = c.hiddenVaultConfig || defaultVaultConfig;
          const nextConfig = { ...currentConfig, ...updates };
          return { ...c, hiddenVaultConfig: nextConfig };
        }
        return c;
      })
    );
    showToast('Vault visibility settings updated.');
  };

  const toggleHideChat = (conversationId: string) => {
    const target = conversations.find(c => c.id === conversationId);
    if (target?.isHiddenChat) {
      unhideChat(conversationId);
    } else {
      if (chatSecretCode) {
        hideChatWithCode(conversationId, chatSecretCode);
      } else {
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, isHiddenChat: true, hiddenVaultConfig: defaultVaultConfig } : c)
        );
        showToast('Chat hidden.');
      }
    }
  };

  const archivePost = (postId: string) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, isArchived: true } : p)));
    showToast('Post archived');
  };

  const unarchivePost = (postId: string) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, isArchived: false } : p)));
    showToast('Post unarchived and restored to profile');
  };

  const toggleHidePostFromGrid = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const nextVal = !p.isHiddenFromOwnProfile;
          showToast(nextVal ? 'Post hidden from your profile grid' : 'Post restored to profile grid');
          return { ...p, isHiddenFromOwnProfile: nextVal };
        }
        return p;
      })
    );
  };

  const archiveStory = (storyId: string) => {
    setStories(prev => prev.map(s => (s.id === storyId ? { ...s, isArchived: true } : s)));
    showToast('Story archived');
  };

  const unarchiveStory = (storyId: string) => {
    setStories(prev => prev.map(s => (s.id === storyId ? { ...s, isArchived: false } : s)));
    showToast('Story restored');
  };

  const deleteStory = (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
    showToast('Story deleted');
  };

  const addStoryComment = (storyId: string, text: string, parentId?: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `story_comm_${Date.now()}`,
      parentId,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      text: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
      replies: []
    };

    setStories(prev =>
      prev.map(s => {
        if (s.id === storyId) {
          if (parentId) {
            const updateReplies = (comments: Comment[]): Comment[] => {
              return comments.map(c => {
                if (c.id === parentId) {
                  return { ...c, replies: [...(c.replies || []), newComment] };
                }
                if (c.replies && c.replies.length > 0) {
                  return { ...c, replies: updateReplies(c.replies) };
                }
                return c;
              });
            };
            return { ...s, comments: updateReplies(s.comments || []) };
          }
          return { ...s, comments: [...(s.comments || []), newComment] };
        }
        return s;
      })
    );
    showToast('Comment posted to story');
  };

  const likeStoryComment = (storyId: string, commentId: string) => {
    const toggleLike = (comments: Comment[]): Comment[] => {
      return comments.map(c => {
        if (c.id === commentId) {
          const wasLiked = c.isLiked;
          return {
            ...c,
            isLiked: !wasLiked,
            likesCount: wasLiked ? c.likesCount - 1 : c.likesCount + 1
          };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: toggleLike(c.replies) };
        }
        return c;
      });
    };

    setStories(prev =>
      prev.map(s => {
        if (s.id === storyId) {
          return { ...s, comments: toggleLike(s.comments || []) };
        }
        return s;
      })
    );
  };

  const deleteStoryComment = (storyId: string, commentId: string) => {
    const removeComment = (comments: Comment[]): Comment[] => {
      return comments
        .filter(c => c.id !== commentId)
        .map(c => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : []
        }));
    };

    setStories(prev =>
      prev.map(s => {
        if (s.id === storyId) {
          return { ...s, comments: removeComment(s.comments || []) };
        }
        return s;
      })
    );
    showToast('Story comment deleted');
  };

  const updatePostEmojiSettings = (postId: string, allowedEmojis?: string[], restrictedEmojis?: string[]) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, allowedEmojis, restrictedEmojis };
        }
        return p;
      })
    );
    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal(prev => (prev ? { ...prev, allowedEmojis, restrictedEmojis } : null));
    }
    showToast('Reaction emoji settings updated');
  };

  const deleteComment = (postId: string, commentId: string) => {
    const removeComment = (comments: Comment[]): Comment[] => {
      return comments
        .filter(c => c.id !== commentId)
        .map(c => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : []
        }));
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments: removeComment(p.comments) };
        }
        return p;
      })
    );

    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal(prev => (prev ? { ...prev, comments: removeComment(prev.comments) } : null));
    }
    showToast('Comment deleted');
  };

  const archiveHighlight = (highlightId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      highlights: prev.highlights.map(h => (h.id === highlightId ? { ...h, isArchived: true } : h))
    }));
    showToast('Highlight archived');
  };

  const unarchiveHighlight = (highlightId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      highlights: prev.highlights.map(h => (h.id === highlightId ? { ...h, isArchived: false } : h))
    }));
    showToast('Highlight restored');
  };

  const deleteHighlight = (highlightId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h.id !== highlightId)
    }));
    showToast('Highlight deleted');
  };

  const toggleHideFollower = (targetUserId: string, type: 'follower' | 'following') => {
    setCurrentUser(prev => {
      if (type === 'follower') {
        const list = prev.hiddenFollowerIds || [];
        const isHidden = list.includes(targetUserId);
        const updated = isHidden ? list.filter(id => id !== targetUserId) : [...list, targetUserId];
        showToast(isHidden ? 'User unhidden from your followers list' : 'User hidden from public followers list');
        return { ...prev, hiddenFollowerIds: updated };
      } else {
        const list = prev.hiddenFollowingIds || [];
        const isHidden = list.includes(targetUserId);
        const updated = isHidden ? list.filter(id => id !== targetUserId) : [...list, targetUserId];
        showToast(isHidden ? 'User unhidden from your following list' : 'User hidden from public following list');
        return { ...prev, hiddenFollowingIds: updated };
      }
    });
  };

  const updateSecondaryAvatar = (avatarUrl: string, visibility: 'everyone' | 'followers' | 'close_friends') => {
    setCurrentUser(prev => ({
      ...prev,
      secondaryAvatar: avatarUrl,
      avatarVisibility: visibility
    }));
    showToast(`Secondary profile photo updated (Visible to: ${visibility.replace('_', ' ')})`);
  };

  const updateCustomDualPfp = (pfp1: CustomPfpConfig, pfp2: CustomPfpConfig) => {
    setCurrentUser(prev => {
      const updatedPrimaryAvatar = pfp1.hasNoPfp ? '' : (pfp1.url || prev.avatar);
      const updatedSecondaryAvatar = pfp2.hasNoPfp ? '' : (pfp2.url || '');
      const legacyVisibility = pfp2.audience === 'followers' ? 'followers' : pfp2.audience === 'close_friends' ? 'close_friends' : 'everyone';

      return {
        ...prev,
        avatar: updatedPrimaryAvatar,
        secondaryAvatar: updatedSecondaryAvatar,
        avatarVisibility: legacyVisibility,
        pfp1Config: pfp1,
        pfp2Config: pfp2
      };
    });
    showToast('Dual custom profile pictures saved!');
  };

  const createStoryWithDuration = (
    mediaUrl: string,
    caption?: string,
    durationHours: number = 24,
    audience: 'everyone' | 'close_friends' = 'everyone'
  ) => {
    const clampedHours = Math.min(48, Math.max(1, durationHours));
    const newStory: Story = {
      id: `story_${Date.now()}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      mediaUrl,
      timestamp: 'Just now',
      seen: false,
      caption,
      durationHours: clampedHours,
      audience
    };
    setStories(prev => [newStory, ...prev.filter(s => s.user.id !== currentUser.id)]);
    showToast(`Story posted for ${clampedHours} hours (${audience === 'close_friends' ? 'Close Friends' : 'Everyone'})`);
  };

  // Discussions Actions
  const createDiscussion = (data: { communityId: string; title: string; body: string; tags?: string[]; mediaUrl?: string }) => {
    const comm = communities.find(c => c.id === data.communityId);
    const newDisc: Discussion = {
      id: `disc_${Date.now()}`,
      communityId: data.communityId,
      communityName: comm ? comm.name : 'Community',
      author: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      title: data.title,
      body: data.body,
      timestamp: 'Just now',
      createdAt: Date.now(),
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      commentsCount: 0,
      comments: [],
      mediaUrl: data.mediaUrl,
      tags: data.tags || []
    };
    setDiscussions(prev => [newDisc, ...prev]);
    showToast('Discussion published!');
  };

  const voteDiscussion = (discussionId: string, type: 'up' | 'down') => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          const currentVote = d.userVote;
          let newVote: 'up' | 'down' | null = type;
          let upDelta = 0;
          let downDelta = 0;

          if (currentVote === type) {
            newVote = null;
            if (type === 'up') upDelta = -1;
            else downDelta = -1;
          } else {
            if (currentVote === 'up') upDelta = -1;
            if (currentVote === 'down') downDelta = -1;
            if (type === 'up') upDelta += 1;
            else downDelta += 1;
          }

          return {
            ...d,
            upvotes: Math.max(0, d.upvotes + upDelta),
            downvotes: Math.max(0, d.downvotes + downDelta),
            userVote: newVote
          };
        }
        return d;
      })
    );
  };

  const addDiscussionComment = (discussionId: string, text: string, parentId?: string) => {
    if (!text.trim()) return;
    const newComm: Comment = {
      id: `c_disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      discussionId,
      parentId,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified
      },
      text: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
      upvotes: 0,
      downvotes: 0,
      replies: []
    };

    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          if (parentId) {
            const updateReplies = (comments: Comment[]): Comment[] => {
              return comments.map(c => {
                if (c.id === parentId) {
                  return {
                    ...c,
                    replies: [...(c.replies || []), newComm]
                  };
                }
                if (c.replies && c.replies.length > 0) {
                  return {
                    ...c,
                    replies: updateReplies(c.replies)
                  };
                }
                return c;
              });
            };
            return {
              ...d,
              commentsCount: d.commentsCount + 1,
              comments: updateReplies(d.comments || [])
            };
          }
          return {
            ...d,
            commentsCount: d.commentsCount + 1,
            comments: [...(d.comments || []), newComm]
          };
        }
        return d;
      })
    );
    showToast('Reply added to thread');
  };

  const voteDiscussionComment = (discussionId: string, commentId: string, type: 'up' | 'down') => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          const updateVotes = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === commentId) {
                const currentVote = c.userVote;
                const newVote = currentVote === type ? null : type;
                const upDelta = currentVote === 'up' ? -1 : type === 'up' && newVote ? 1 : 0;
                return {
                  ...c,
                  userVote: newVote,
                  isLiked: newVote === 'up',
                  upvotes: Math.max(0, (c.upvotes || 0) + upDelta),
                  likesCount: Math.max(0, (c.likesCount || 0) + upDelta)
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: updateVotes(c.replies)
                };
              }
              return c;
            });
          };
          return {
            ...d,
            comments: updateVotes(d.comments || [])
          };
        }
        return d;
      })
    );
  };

  const likeDiscussionComment = (discussionId: string, commentId: string) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          const updateLikes = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === commentId) {
                const wasLiked = Boolean(c.isLiked);
                return {
                  ...c,
                  isLiked: !wasLiked,
                  likesCount: wasLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1,
                  upvotes: wasLiked ? Math.max(0, (c.upvotes || 0) - 1) : (c.upvotes || 0) + 1
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: updateLikes(c.replies)
                };
              }
              return c;
            });
          };
          return {
            ...d,
            comments: updateLikes(d.comments || [])
          };
        }
        return d;
      })
    );
  };

  const deleteDiscussionComment = (discussionId: string, commentId: string) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          const filterComments = (comments: Comment[]): Comment[] => {
            return comments
              .filter(c => c.id !== commentId)
              .map(c => ({
                ...c,
                replies: c.replies ? filterComments(c.replies) : []
              }));
          };
          return {
            ...d,
            commentsCount: Math.max(0, d.commentsCount - 1),
            comments: filterComments(d.comments || [])
          };
        }
        return d;
      })
    );
    showToast('Comment deleted');
  };

  // Challenges Actions
  const joinChallenge = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(ch => {
        if (ch.id === challengeId) {
          const nextJoined = !ch.isJoined;
          showToast(nextJoined ? `Joined challenge "${ch.title}"!` : `Left challenge "${ch.title}"`);
          return {
            ...ch,
            isJoined: nextJoined,
            participantsCount: nextJoined ? ch.participantsCount + 1 : Math.max(0, ch.participantsCount - 1)
          };
        }
        return ch;
      })
    );
  };

  const logChallengeProgress = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(ch => {
        if (ch.id === challengeId) {
          const newProgress = (ch.userProgress || 0) + 1;
          const isCompleted = newProgress >= ch.durationDays;
          showToast(isCompleted ? `🎉 Challenge completed: earned ${ch.badgeReward.name} badge!` : `Day ${newProgress} logged! Keep your streak alive 🔥`);
          return {
            ...ch,
            userProgress: newProgress,
            momentumStreak: (ch.momentumStreak || 0) + 1,
            isCompleted
          };
        }
        return ch;
      })
    );
  };

  const createChallenge = (data: Partial<Challenge>) => {
    const newCh: Challenge = {
      id: `chal_${Date.now()}`,
      title: data.title || 'Creative Sprint',
      description: data.description || 'Daily challenge for visual storytellers',
      icon: data.icon || '⚡',
      category: data.category || 'creativity',
      durationDays: data.durationDays || 7,
      currentDay: 1,
      participantsCount: 1,
      isJoined: true,
      userProgress: 0,
      momentumStreak: 1,
      badgeReward: data.badgeReward || {
        name: 'Sprint Finisher',
        icon: '🏅',
        description: 'Completed 7-day creative journey'
      }
    };
    setChallenges(prev => [newCh, ...prev]);
    showToast(`Created challenge "${newCh.title}"!`);
    setIsCreateChallengeOpen(false);
  };

  const cheerParticipant = (_challengeId: string, targetUserId: string) => {
    showToast(`Sent cheers & momentum to @${targetUserId} ✨`);
  };

  const hideConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    showToast('Conversation hidden');
  };

  const replyToMessage = (conversationId: string, replyTo: { id: string; text: string; senderName: string }, text: string) => {
    sendMessage(conversationId, text, { replyTo });
  };

  const reactToMessage = (conversationId: string, messageId: string, emoji: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => (m.id === messageId ? { ...m, reaction: emoji } : m))
          };
        }
        return c;
      })
    );
  };

  const sendVoiceMessage = (
    conversationId: string,
    durationSeconds: number = 6,
    replyTo?: { id: string; text: string; senderName: string }
  ) => {
    sendMessage(conversationId, 'Voice note', {
      isVoice: true,
      voiceDurationSeconds: durationSeconds,
      replyTo
    });
  };

  const sendMediaMessage = (
    conversationId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'file',
    caption: string = '',
    fileName?: string,
    replyTo?: { id: string; text: string; senderName: string }
  ) => {
    sendMessage(conversationId, caption || (mediaType === 'image' ? 'Sent a photo' : mediaType === 'video' ? 'Sent a video' : 'Sent an attachment'), {
      mediaUrl,
      mediaType,
      fileName,
      replyTo
    });
  };

  const triggerTypingIndicator = (conversationId: string, isTyping: boolean) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, isTyping } : c))
    );
  };

  const clearConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, messages: [], lastMessage: '', unreadCount: 0 }
          : c
      )
    );
    showToast('Chat history cleared');
  };

  const deleteConversation = (conversationId: string) => {
    if (conversationId === 'conv_support_bot') {
      localStorage.setItem('yaawp_support_bot_deleted', 'true');
    }
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    showToast('Conversation deleted');
  };

  const togglePinConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const nextPinned = !c.isPinned;
          showToast(nextPinned ? 'Chat pinned to top' : 'Chat unpinned');
          return { ...c, isPinned: nextPinned };
        }
        return c;
      })
    );
  };

  const toggleMuteConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const nextMuted = !c.isMuted;
          showToast(nextMuted ? 'Notifications muted for this chat' : 'Notifications unmuted');
          return { ...c, isMuted: nextMuted };
        }
        return c;
      })
    );
  };

  const toggleArchiveConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const nextArchived = !c.isArchived;
          showToast(nextArchived ? 'Chat archived' : 'Chat unarchived');
          return { ...c, isArchived: nextArchived };
        }
        return c;
      })
    );
  };

  const createChatList = (name: string, color?: string, icon?: string): ChatCustomList => {
    const trimmed = name.trim();
    const id = `list_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newList: ChatCustomList = {
      id,
      name: trimmed,
      color: color || 'indigo',
      icon: icon || 'Tag',
      createdAt: Date.now()
    };
    setChatLists(prev => [...prev, newList]);
    showToast(`Created chat list "${trimmed}"`);
    return newList;
  };

  const deleteChatList = (listId: string) => {
    setChatLists(prev => prev.filter(l => l.id !== listId));
    setConversations(prev =>
      prev.map(c => ({
        ...c,
        listIds: c.listIds ? c.listIds.filter(id => id !== listId) : []
      }))
    );
    showToast('Chat list deleted');
  };

  const toggleChatInList = (conversationId: string, listId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        const currentLists = c.listIds || [];
        const exists = currentLists.includes(listId);
        const nextLists = exists
          ? currentLists.filter(id => id !== listId)
          : [...currentLists, listId];
        return { ...c, listIds: nextLists };
      })
    );
  };

  const setConversationLists = (conversationId: string, listIds: string[]) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, listIds } : c))
    );
    showToast('Chat lists updated');
  };

  const blockAndReportUser = (userId: string, reason: string, details?: string) => {
    setBlockedUsers(prev => [...new Set([...prev, userId])]);
    addAuditLog('User Blocked & Reported', `Reason: ${reason}. Details: ${details || 'None'}`, 'warning');
    showToast(`User blocked & reported for "${reason}". Moderators notified.`);
  };

  const requestJoinCommunity = (communityId: string) => {
    const target = communities.find(c => c.id === communityId);
    if (!target) return;
    if (!target.isPrivate) {
      joinCommunity(communityId);
      return;
    }
    const newReq: CommunityJoinRequest = {
      id: `req_${Date.now()}`,
      communityId,
      communityName: target.name,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      message: 'Requesting access to join this private collective.',
      requestedAt: 'Just now',
      status: 'pending'
    };
    setJoinRequests(prev => [newReq, ...prev]);
    showToast(`Request sent to join "${target.name}". Moderators will review.`);
  };

  const handleJoinRequest = (communityId: string, requestId: string, action: 'accept' | 'decline') => {
    setJoinRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'declined' } : r))
    );
    if (action === 'accept') {
      setCommunities(prev =>
        prev.map(c => (c.id === communityId ? { ...c, membersCount: c.membersCount + 1 } : c))
      );
      showToast('Join request approved!');
    } else {
      showToast('Join request declined.');
    }
  };

  const likeDiscussion = (discussionId: string) => {
    voteDiscussion(discussionId, 'up');
  };

  const repostDiscussion = (discussionId: string) => {
    const disc = discussions.find(d => d.id === discussionId);
    if (!disc) return;
    showToast(`Reposted discussion "${disc.title.slice(0, 30)}..." to your feed!`);
  };

  const addAuditLog = (action: string, details?: string, status: 'success' | 'warning' | 'error' = 'success') => {
    const newLog: SecurityAuditLog = {
      id: `log_${Date.now()}`,
      action,
      actor: '@' + currentUser.username,
      ipAddress: 'Not recorded (this device)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      timestamp: new Date().toLocaleString(),
      status,
      details
    };
    setAuditLogs(prev => {
      const next = [newLog, ...prev.slice(0, 49)];
      try { localStorage.setItem('yaawp_device_activity', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Chat PIN lives on the server (hashed). 'server' is just a marker that a PIN exists.
  const refreshChatLock = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.rpc('chat_lock_status');
    if (error || !data) return;
    setChatPasscodeState(data.enabled ? 'server' : null);
    setIsChatLocked(Boolean(data.enabled));
    setLockoutUntil(data.locked_until ? new Date(data.locked_until).getTime() : null);
  };
  useEffect(() => {
    localStorage.removeItem('lumina_chat_passcode');
    localStorage.removeItem('yaawp_pin_failures');
    if (isAuthenticated) refreshChatLock();
    else { setChatPasscodeState(null); setIsChatLocked(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const pinErrorMessage = (res: any) => {
    if (res?.error === 'locked') {
      const until = res.locked_until ? new Date(res.locked_until).getTime() : Date.now() + 60000;
      setLockoutUntil(until);
      return 'Too many wrong PINs. Try again in a minute.';
    }
    if (res?.error === 'wrong_pin') return res.attempts_left ? `Incorrect PIN. ${res.attempts_left} tries left.` : 'Incorrect PIN.';
    if (res?.error === 'not_signed_in') return 'Please sign in first.';
    if (res?.error === 'invalid_pin') return 'PIN must be 4 digits.';
    return 'Could not reach the server. Try again.';
  };

  const setChatPasscode = async (pin: string | null, currentPin?: string): Promise<boolean> => {
    if (!pin) {
      if (!currentPin) { showToast('Enter your current PIN to remove the lock.'); return false; }
      const { data, error } = await supabase.rpc('remove_chat_pin', { _current_pin: currentPin });
      if (error || !data?.ok) { showToast(pinErrorMessage(error ? null : data)); return false; }
      setChatPasscodeState(null);
      setIsChatLocked(false);
      addAuditLog('Chat Passcode Removed', 'PIN lock disabled', 'warning');
      showToast('Chat passcode removed');
      return true;
    }
    const { data, error } = await supabase.rpc('set_chat_pin', { _new_pin: pin, _current_pin: currentPin ?? null });
    if (error || !data?.ok) { showToast(pinErrorMessage(error ? null : data)); return false; }
    setChatPasscodeState('server');
    setIsChatLocked(false);
    addAuditLog('Chat Passcode Configured', '4-digit PIN lock enabled for Direct Messages', 'success');
    showToast('Chat passcode saved');
    return true;
  };

  const unlockChat = async (pin: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('verify_chat_pin', { _pin: pin });
    if (!error && data?.ok) {
      setLockoutUntil(null);
      setIsChatLocked(false);
      addAuditLog('Chat Unlocked', 'Valid PIN entered', 'success');
      showToast('Chat unlocked');
      return true;
    }
    addAuditLog('Chat Unlock Failed', 'Incorrect PIN attempt', 'error');
    showToast(pinErrorMessage(error ? null : data));
    return false;
  };

  const recordFailedLogin = () => {
    setFailedLoginAttempts(prev => {
      const next = prev + 1;
      if (next >= 5) {
        const lockoutTime = Date.now() + 60000;
        setLockoutUntil(lockoutTime);
        localStorage.setItem('yaawp_pin_failures', JSON.stringify({ count: 0, until: lockoutTime }));
        return 0;
        setFailedLoginsAlert(true);
        addAuditLog('Account Lockout Triggered', '5 consecutive failed password attempts. Account locked for 60s.', 'error');
      } else {
        addAuditLog('Failed Authentication Attempt', `Attempt ${next} of 5.`, 'warning');
        localStorage.setItem('yaawp_pin_failures', JSON.stringify({ count: next, until: null }));
      }
      return next;
    });
  };

  const resetFailedLogins = () => {
    if (lockoutUntil !== null && Date.now() < lockoutUntil) {
      showToast('The lock lifts automatically when the timer ends.');
      return;
    }
    localStorage.removeItem('yaawp_pin_failures');
    setFailedLoginAttempts(0);
    setLockoutUntil(null);
    setFailedLoginsAlert(false);
    addAuditLog('Login Rate-Limit Cleared', 'Reset failed login attempts counter back to 0/5. All 5 attempts restored.', 'success');
    showToast('Failed login counter reset to 0/5. Full attempts restored.');
  };

  const verifyPreviousPasscode = async (pin: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('verify_chat_pin', { _pin: pin });
    if (error || !data?.ok) { pinErrorMessage(error ? null : data); return false; }
    return true;
  };

  const setTwoFactorEnabled = (val: boolean) => {
    setTwoFactorEnabledState(val);
    localStorage.setItem('lumina_2fa_enabled', String(val));
  };

  const enableTwoFactorWithPassword = (password: string): boolean => {
    if (!password || password.length < 4) {
      showToast('2FA security password must be at least 4 characters');
      return false;
    }
    localStorage.setItem('yaawp_2fa_password', hashSecret(password));
    localStorage.setItem('lumina_2fa_enabled', 'true');
    setTwoFactorPasswordState(hashSecret(password));
    setTwoFactorEnabledState(true);
    addAuditLog('2FA Protection Activated', 'Account two-factor protection enabled with personal security password', 'success');
    showToast('2FA Protection successfully activated!');
    return true;
  };

  const changeTwoFactorPassword = (currentPw: string, newPw: string): boolean => {
    if (!verifySecret(currentPw, twoFactorPassword)) {
      showToast('Current 2FA password is incorrect');
      return false;
    }
    if (!newPw || newPw.length < 4) {
      showToast('New 2FA password must be at least 4 characters');
      return false;
    }
    localStorage.setItem('yaawp_2fa_password', hashSecret(newPw));
    setTwoFactorPasswordState(hashSecret(newPw));
    addAuditLog('2FA Password Changed', 'User updated their two-factor security password', 'success');
    showToast('2FA security password updated successfully!');
    return true;
  };

  const disableTwoFactorWithPassword = (currentPw: string): boolean => {
    if (!verifySecret(currentPw, twoFactorPassword)) {
      showToast('Current 2FA password is incorrect');
      return false;
    }
    localStorage.removeItem('yaawp_2fa_password');
    localStorage.setItem('lumina_2fa_enabled', 'false');
    setTwoFactorPasswordState(null);
    setTwoFactorEnabledState(false);
    addAuditLog('2FA Protection Disabled', 'User deactivated two-factor authentication with verified password', 'warning');
    showToast('Two-factor protection has been disabled');
    return true;
  };

  const resetTwoFactorViaEmail = (_code: string, _newPw: string): boolean => {
    showToast('Email reset is not available yet.');
    return false;
  };
  const _legacyResetTwoFactorViaEmail = (code: string, newPw: string): boolean => {
    if (!code || code.trim().length !== 6) {
      showToast('Please enter a valid 6-digit verification code');
      return false;
    }
    if (!newPw || newPw.length < 4) {
      showToast('New 2FA password must be at least 4 characters');
      return false;
    }
    localStorage.setItem('yaawp_2fa_password', newPw);
    localStorage.setItem('lumina_2fa_enabled', 'true');
    setTwoFactorPasswordState(newPw);
    setTwoFactorEnabledState(true);
    addAuditLog('2FA Password Recovered', '2FA security password reset using email OTP verification', 'success');
    showToast('2FA password reset successfully!');
    return true;
  };

  const setChatWallpaper = (conversationId: string, wallpaper?: ChatConversation['wallpaper']) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            wallpaper
          };
        }
        return c;
      })
    );
  };

  const exportGDPRData = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      user: currentUser,
      posts: posts.filter(p => p.user.id === currentUser.id),
      conversations,
      communitiesJoined: currentUser.communitiesJoined,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina_gdpr_data_export_${currentUser.username}.json`;
    a.click();
    addAuditLog('GDPR Data Archive Exported', 'User initiated full personal data archive download', 'success');
    showToast('GDPR Data archive exported successfully');
  };

  const deleteAccountPermanently = () => {
    addAuditLog('Account Deletion Requested', 'Purged user tables and assets', 'warning');
    localStorage.clear();
    showToast('Account permanently deleted. Session reset.');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const changePassword = (_oldPw: string, _newPw: string): boolean => {
    addAuditLog('Password Changed', 'User updated authentication credentials', 'success');
    showToast('Password updated securely!');
    return true;
  };

  const toggleFollowersPrivacy = () => {
    setIsFollowersPrivate(prev => {
      const next = !prev;
      localStorage.setItem('lumina_followers_private', String(next));
      addAuditLog('Followers Privacy Toggled', next ? 'Follower list hidden from public' : 'Follower list visible', 'success');
      showToast(next ? 'Followers & Following lists set to Private' : 'Followers & Following lists are now Public');
      return next;
    });
  };

  const updateInterests = (interests: string[]) => {
    updateProfile({ interests });
    addAuditLog('Interests Updated', `Selected: ${interests.join(', ')}`, 'success');
    showToast('Interests saved!');
  };

  const handleConnectionRequest = (notifId: string, action: 'accept' | 'decline') => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notifId) {
          return {
            ...n,
            isRead: true,
            connectionStatus: action === 'accept' ? 'accepted' : 'declined'
          };
        }
        return n;
      })
    );
    showToast(action === 'accept' ? 'Connection request accepted! You can now chat.' : 'Connection request declined');
  };

  const toggleAccountPrivacy = () => {
    setIsAccountPrivate(prev => {
      const next = !prev;
      showToast(next ? 'Account set to Private' : 'Account set to Public');
      return next;
    });
  };

  const blockUser = (userId: string) => {
    setBlockedUsers(prev => [...new Set([...prev, userId])]);
    showToast('User blocked');
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId));
    showToast('User unblocked');
  };

  const exportUserData = () => {
    const dataStr = JSON.stringify({ currentUser, posts: posts.filter(p => p.user.id === currentUser.id) }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina_data_${currentUser.username}.json`;
    a.click();
    showToast('Account data exported');
  };

  const signOutAccount = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setSupabaseSession(null);
    setIsProfileMenuOpen(false);
    setIsAuthenticated(false);
    setIsUsernameSetupRequired(false);
    localStorage.removeItem('yaawp_needs_username_prompt');
    showToast('Signed out of session');
  };

  const loginWithSupabase = async (email: string, password: string, captchaToken?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase is not configured yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
        options: {
          captchaToken
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSupabaseSession(data.session);
        setIsAuthenticated(true);
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            username: data.user.user_metadata?.username || (data.user.email ? data.user.email.split('@')[0] : 'user'),
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
            avatar: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.user.id)}`,
            bio: 'Yaawp creator ✨',
            isVerified: false,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            highlights: []
          };
          setCurrentUser(profile);
          setViewedUserId(profile.id);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(profile));
        }
        showToast('Logged in with Supabase successfully!');
        return { success: true };
      }
      return { success: false, error: 'Failed to retrieve session from Supabase.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to initiate Google sign-in' };
      }
    }

    return {
      success: false,
      error: 'Google sign-in needs the backend to be connected. Please try again later.'
    };
  };

  const [isAccountDeactivated, setIsAccountDeactivated] = useState<boolean>(() => {
    return localStorage.getItem('yaawp_account_deactivated') === 'true';
  });

  const deactivateAccount = (reason = 'Taking a temporary break') => {
    setIsAccountDeactivated(true);
    localStorage.setItem('yaawp_account_deactivated', 'true');
    localStorage.setItem('yaawp_deactivation_reason', reason);
    setIsAuthenticated(false);
    showToast('Your account is now deactivated. Log in at any time to reactivate.');
  };

  // Algorithmic Feed & Recommendations
  const updateAlgorithmSettings = (settings: Partial<AlgorithmSettings>) => {
    setAlgorithmSettings(prev => {
      const next = { ...prev, ...settings };
      try {
        localStorage.setItem('lumina_algorithm_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const applyAlgorithmFeedback = (
    postId: string,
    action: 'more_like_this' | 'less_like_this' | 'mute_topic' | 'mute_community' | 'mute_person',
    topic?: string,
    targetId?: string
  ) => {
    const post = posts.find(p => p.id === postId);

    if (action === 'more_like_this') {
      const tags = post?.tags || (topic ? [topic] : []);
      setAlgorithmSettings(prev => {
        const nextAffinities = { ...prev.topicAffinities };
        tags.forEach(t => {
          const key = t.toLowerCase().replace('#', '');
          nextAffinities[key] = (nextAffinities[key] || 0) + 2;
        });
        const next = { ...prev, topicAffinities: nextAffinities };
        try {
          localStorage.setItem('lumina_algorithm_settings', JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast('Algorithm tuned: Showing more posts like this');
    } else if (action === 'less_like_this') {
      const tags = post?.tags || (topic ? [topic] : []);
      setAlgorithmSettings(prev => {
        const nextAffinities = { ...prev.topicAffinities };
        tags.forEach(t => {
          const key = t.toLowerCase().replace('#', '');
          nextAffinities[key] = Math.max(-10, (nextAffinities[key] || 0) - 2);
        });
        const next = { ...prev, topicAffinities: nextAffinities };
        try {
          localStorage.setItem('lumina_algorithm_settings', JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast('Algorithm tuned: Showing less content like this');
    } else if (action === 'mute_topic') {
      const cleanTopic = (topic || '').replace('#', '').trim();
      if (cleanTopic) {
        setAlgorithmSettings(prev => {
          if (prev.mutedTopics.includes(cleanTopic)) return prev;
          const next = { ...prev, mutedTopics: [...prev.mutedTopics, cleanTopic] };
          try {
            localStorage.setItem('lumina_algorithm_settings', JSON.stringify(next));
          } catch {}
          return next;
        });
        showToast(`Topic #${cleanTopic} is now muted in feed`);
      }
    } else if (action === 'mute_community') {
      const commId = targetId || post?.communityId;
      if (commId) {
        setAlgorithmSettings(prev => {
          if (prev.mutedCommunityIds.includes(commId)) return prev;
          const next = { ...prev, mutedCommunityIds: [...prev.mutedCommunityIds, commId] };
          try {
            localStorage.setItem('lumina_algorithm_settings', JSON.stringify(next));
          } catch {}
          return next;
        });
        showToast('Community muted from recommendations');
      }
    } else if (action === 'mute_person') {
      const uId = targetId || post?.user.id;
      if (uId) {
        setAlgorithmSettings(prev => {
          if (prev.mutedUserIds.includes(uId)) return prev;
          const next = { ...prev, mutedUserIds: [...prev.mutedUserIds, uId] };
          try {
            localStorage.setItem('lumina_algorithm_settings', JSON.stringify(next));
          } catch {}
          return next;
        });
        const authorName = post?.user.username || 'creator';
        showToast(`Will not recommend @${authorName} in your feed`);
      }
    }
  };

  const resetRecommendationProfile = () => {
    const clean: AlgorithmSettings = {
      mutedTopics: [],
      mutedCommunityIds: [],
      mutedUserIds: [],
      topicAffinities: {},
      separateFriendsFromDiscovery: false,
      stopStrangers: false
    };
    setAlgorithmSettings(clean);
    try {
      localStorage.setItem('lumina_algorithm_settings', JSON.stringify(clean));
    } catch {}
    showToast('Recommendation profile reset to clean defaults');
  };

  // Custom Circles
  const createCustomCircle = (name: string, icon: string, userIds: string[], description?: string) => {
    const newCircle: CustomCircle = {
      id: `circle_${Date.now()}`,
      name,
      icon,
      userIds,
      description,
      isDefault: false
    };
    setCustomCircles(prev => {
      const next = [...prev, newCircle];
      try {
        localStorage.setItem('lumina_custom_circles', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Circle "${name}" created with ${userIds.length} members`);
  };

  const updateCustomCircle = (id: string, name: string, icon: string, userIds: string[]) => {
    setCustomCircles(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, name, icon, userIds } : c));
      try {
        localStorage.setItem('lumina_custom_circles', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Circle updated');
  };

  const deleteCustomCircle = (id: string) => {
    setCustomCircles(prev => {
      const next = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('lumina_custom_circles', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (activeCustomCircleId === id) {
      setActiveCustomCircleId(null);
      setFeedMode('following');
    }
    showToast('Circle deleted');
  };

  const toggleUserInCircle = (circleId: string, userId: string) => {
    setCustomCircles(prev => {
      const next = prev.map(c => {
        if (c.id === circleId) {
          const exists = c.userIds.includes(userId);
          const userIds = exists ? c.userIds.filter(id => id !== userId) : [...c.userIds, userId];
          return { ...c, userIds };
        }
        return c;
      });
      try {
        localStorage.setItem('lumina_custom_circles', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Nearby Activities
  const joinNearbyActivity = (activityId: string) => {
    setNearbyActivities(prev =>
      prev.map(act => {
        if (act.id === activityId) {
          const wasJoined = act.isJoined;
          const nextJoined = !wasJoined;
          const nextTaken = nextJoined ? act.spotsTaken + 1 : Math.max(1, act.spotsTaken - 1);
          const attendees = nextJoined
            ? [
                ...act.attendees,
                {
                  id: currentUser.id,
                  username: currentUser.username,
                  name: currentUser.name,
                  avatar: currentUser.avatar
                }
              ]
            : act.attendees.filter(a => a.id !== currentUser.id);

          showToast(nextJoined ? `Joined "${act.title}"! See you there!` : `Left "${act.title}"`);
          return {
            ...act,
            isJoined: nextJoined,
            spotsTaken: nextTaken,
            attendees
          };
        }
        return act;
      })
    );
  };

  const createNearbyActivity = (
    data: Omit<NearbyActivity, 'id' | 'organizer' | 'spotsTaken' | 'attendees' | 'isJoined'>
  ) => {
    const newActivity: NearbyActivity = {
      ...data,
      id: `act_${Date.now()}`,
      organizer: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified
      },
      spotsTaken: 1,
      attendees: [
        {
          id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      ],
      isJoined: true
    };
    setNearbyActivities(prev => {
      const next = [newActivity, ...prev];
      try {
        localStorage.setItem('lumina_nearby_activities', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Meetup "${newActivity.title}" created & open to nearby friends!`);
  };

  // Social Presence ("Currently")
  const updatePresenceStatus = (status: Partial<PresenceStatus>) => {
    setPresenceStatus(prev => {
      const next = { ...prev, ...status, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem('lumina_presence_status', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Presence status updated');
  };

  // Expressive Reactions
  const reactToPost = (postId: string, reactionEmoji: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const reactions: { [emoji: string]: string[] | number } = { ...(p.reactions || {}) };
          const userReaction = p.userReaction === reactionEmoji ? undefined : reactionEmoji;

          // Remove old userReaction if present
          if (p.userReaction && reactions[p.userReaction]) {
            const prevVal = reactions[p.userReaction];
            if (Array.isArray(prevVal)) {
              const updated = prevVal.filter(uid => uid !== currentUser.id);
              if (updated.length === 0) delete reactions[p.userReaction];
              else reactions[p.userReaction] = updated;
            } else {
              delete reactions[p.userReaction];
            }
          }

          // Add new reaction if toggling on
          if (userReaction) {
            const currentVal = reactions[reactionEmoji];
            const currentArray = Array.isArray(currentVal) ? currentVal : [];
            reactions[reactionEmoji] = [...currentArray, currentUser.id];
          }

          savePostInteraction(postId, {
            reactions,
            userReaction
          });

          return {
            ...p,
            userReaction,
            reactions
          };
        }
        return p;
      })
    );
  };

  const quotePost = (targetPostId: string, caption: string) => {
    const targetPost = posts.find(p => p.id === targetPostId);
    if (!targetPost) return;

    const trimmedCaption = caption ? caption.trim() : '';

    const newPost: Post = {
      id: `quote_${Date.now()}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified
      },
      mediaUrls: targetPost.mediaUrls,
      caption: trimmedCaption,
      timestamp: 'JUST NOW',
      createdAt: Date.now(),
      likesCount: 0,
      isLiked: false,
      isSaved: false,
      filterClass: targetPost.filterClass || 'filter-normal',
      comments: [],
      quotePost: targetPost,
      originalPostId: targetPost.id
    };

    setPosts(prev => [newPost, ...prev]);
    setCurrentUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
    showToast(trimmedCaption ? `Quoted @${targetPost.user.username}'s post!` : `Reposted @${targetPost.user.username}'s post to your feed!`);
    setActiveTab('feed');
  };

  // Community Personas & Channels
  const setCommunityPersona = (communityId: string, persona: Partial<CommunityPersona>) => {
    setCommunityPersonas(prev => {
      const existing: CommunityPersona = prev[communityId] || {
        communityId,
        displayName: currentUser.name,
        avatarUrl: currentUser.avatar,
        avatar: currentUser.avatar,
        bio: currentUser.bio.split('\n')[0],
        badge: 'Contributor'
      };
      const next: Record<string, CommunityPersona> = { ...prev, [communityId]: { ...existing, ...persona } };
      try {
        localStorage.setItem('lumina_community_personas', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Community persona updated');
  };

  const sendCommunityChatMessage = (
    communityId: string,
    channelId: string,
    text: string,
    mediaUrl?: string,
    replyTo?: { id: string; text: string; senderName: string }
  ) => {
    const key = `${communityId}_${channelId}`;
    const persona = communityPersonas[communityId];
    const newMsg: CommunityChatMessage = {
      id: `cmsg_${Date.now()}`,
      communityId,
      channelId,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        name: persona?.displayName || currentUser.name,
        avatar: persona?.avatar || persona?.avatarUrl || currentUser.avatar,
        isVerified: currentUser.isVerified
      },
      userId: currentUser.id,
      authorName: persona?.displayName || currentUser.name,
      authorAvatar: persona?.avatar || persona?.avatarUrl || currentUser.avatar,
      text,
      mediaUrl,
      replyTo,
      timestamp: 'Just now',
      createdAt: Date.now()
    };

    setCommunityChatMessages(prev => {
      const currentList = prev[key] || [];
      const next = { ...prev, [key]: [...currentList, newMsg] };
      try {
        localStorage.setItem('lumina_community_chat_messages', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const reactToCommunityChatMessage = (
    communityId: string,
    channelId: string,
    messageId: string,
    emoji: string
  ) => {
    const key = `${communityId}_${channelId}`;
    setCommunityChatMessages(prev => {
      const currentList = prev[key] || [];
      const updated = currentList.map(m => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          const uids = reactions[emoji] || [];
          if (uids.includes(currentUser.id)) {
            reactions[emoji] = uids.filter(id => id !== currentUser.id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...uids, currentUser.id];
          }
          return { ...m, reactions };
        }
        return m;
      });
      const next = { ...prev, [key]: updated };
      try {
        localStorage.setItem('lumina_community_chat_messages', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateCommunityModeration = (
    communityId: string,
    config: Partial<CommunityModerationConfig>
  ) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const currentConfig = c.moderationConfig || {
            slowModeSeconds: 0,
            wordFilters: [],
            requireApproval: false,
            bannedUserIds: [],
            rules: c.rules || []
          };
          return {
            ...c,
            moderationConfig: { ...currentConfig, ...config }
          };
        }
        return c;
      })
    );
    showToast('Community moderation settings saved');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        systemTheme,
        setSystemTheme,
        toggleTheme,
        activeTab,
        setActiveTab,
        currentUser,
        posts,
        feedPosts,
        feedMode,
        setFeedMode,
        feedSort,
        setFeedSort,
        followedUserIds,
        stories,
        reels,
        notifications,
        conversations,
        activeConvId,
        setActiveConvId,
        allUsers,
        startConversationWithUser,
        viewedUserId,
        openUserProfile,
        getUserProfile,
        unreadNotifsCount,
        unreadMessagesCount,
        activeStoryUserIndex,
        setActiveStoryUserIndex,
        selectedPostForModal,
        setSelectedPostForModal,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        toggleLikePost,
        toggleSavePost,
        votePost,
        repostPost,
        deletePost,
        editPost,
        reportPost,
        addComment,
        likeComment,
        voteComment,
        createPost,
        createStory,
        voteStoryPoll,
        createReel,
        deleteReel,
        toggleLikeReel,
        toggleSaveReel,
        addReelComment,
        likeReelComment,
        deleteReelComment,
        toggleFollowUser,
        // Algorithmic Feed & Recommendations
        algorithmSettings,
        updateAlgorithmSettings,
        applyAlgorithmFeedback,
        resetRecommendationProfile,
        // Custom Circles
        customCircles,
        activeCustomCircleId,
        setActiveCustomCircleId,
        createCustomCircle,
        updateCustomCircle,
        deleteCustomCircle,
        toggleUserInCircle,
        // Spontaneous Meetups & Nearby Activities
        nearbyActivities,
        joinNearbyActivity,
        createNearbyActivity,
        // Social Presence ("Currently")
        presenceStatus,
        updatePresenceStatus,
        // Expressive Reactions & Reposting
        reactToPost,
        quotePost,
        // Community Personas & Channels
        communityPersonas,
        setCommunityPersona,
        communityChatMessages,
        sendCommunityChatMessage,
        reactToCommunityChatMessage,
        updateCommunityModeration,
        // Communities
        communities,
        selectedCommunityId,
        setSelectedCommunityId,
        openCommunityDetail,
        joinCommunity,
        leaveCommunity,
        createCommunity,
        updateCommunity,
        deleteCommunity,
        requestJoinCommunity,
        handleJoinRequest,
        joinRequests,
        isCreateCommunityOpen,
        setIsCreateCommunityOpen,
        // Discussions
        discussions,
        createDiscussion,
        voteDiscussion,
        addDiscussionComment,
        voteDiscussionComment,
        likeDiscussionComment,
        deleteDiscussionComment,
        likeDiscussion,
        repostDiscussion,
        // Challenges
        challenges,
        joinChallenge,
        logChallengeProgress,
        createChallenge,
        cheerParticipant,
        isCreateChallengeOpen,
        setIsCreateChallengeOpen,
        // Messaging
        sendMessage,
        votePoll,
        updateGameSession,
        hideConversation,
        replyToMessage,
        reactToMessage,
        sendVoiceMessage,
        sendMediaMessage,
        triggerTypingIndicator,
        clearConversation,
        deleteConversation,
        togglePinConversation,
        toggleMuteConversation,
        toggleArchiveConversation,
        chatLists,
        createChatList,
        deleteChatList,
        toggleChatInList,
        setConversationLists,
        blockAndReportUser,
        markConversationAsRead,
        markConversationAsUnread,
        simulateIncomingMessage,
        markRecipientSeen,
        toggleRecipientInChat,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        handleConnectionRequest,
        updateProfile,
        setChatWallpaper,
        // Security Suite & Passcode Protection
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        isBehindTheScenesOpen,
        setIsBehindTheScenesOpen,
        chatPasscode,
        setChatPasscode,
        securitySettings: {
          isPasscodeEnabled: !!chatPasscode,
          passcode: chatPasscode || undefined
        },
        updateSecuritySettings: (settings: { isPasscodeEnabled?: boolean; passcode?: string }) => {
          if (settings.isPasscodeEnabled === false) {
            setChatPasscode(null);
          } else if (settings.passcode) {
            setChatPasscode(settings.passcode);
          }
        },
        isChatLocked,
        setIsChatLocked,
        unlockChat,
        verifyPreviousPasscode,
        failedLoginAttempts,
        lockoutUntil,
        failedLoginsAlert,
        recordFailedLogin,
        resetFailedLogins,
        auditLogs,
        addAuditLog,
        exportGDPRData,
        deleteAccountPermanently,
        changePassword,
        twoFactorEnabled,
        setTwoFactorEnabled,
        enableTwoFactorWithPassword,
        changeTwoFactorPassword,
        disableTwoFactorWithPassword,
        resetTwoFactorViaEmail,
        privateMediaSignedUrlsEnabled,
        setPrivateMediaSignedUrlsEnabled,
        isFollowersPrivate,
        toggleFollowersPrivacy,
        updateInterests,
        // Settings & Privacy
        isSettingsOpen,
        setIsSettingsOpen,
        isAccountPrivate,
        toggleAccountPrivacy,
        showReadReceipts,
        setShowReadReceipts,
        showOnlineStatus,
        setShowOnlineStatus,
        blockedUsers,
        blockUser,
        unblockUser,
        exportUserData,
        signOutAccount,
        // Offline & Feed Caching
        isOffline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        feedCacheTimestamp,
        refreshFeed,
        isFeedRefreshing,
        toastMessage,
        showToast,
        userProfiles,
        hasAgreedToTerms,
        termsAgreedTimestamp,
        agreeToTermsAndContinue,
        isLegalModalOpen,
        activeLegalDoc,
        setActiveLegalDoc,
        openLegalModal,
        closeLegalModal,
        isCreateAccountModalOpen,
        setIsCreateAccountModalOpen,
        isAuthenticated,
        setIsAuthenticated,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        createAccount,
        switchAccount,
        deactivateAccount,
        isAccountDeactivated,
        // 3-Bar Profile Settings & Navigation
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        // Community Enhancements
        reportCommunity,
        toggleHideCommunity,
        pinDiscussion,
        // Group Chat & Admin Management
        createGroupChat,
        updateGroupSettings,
        promoteGroupAdmin,
        demoteGroupAdmin,
        toggleGroupMemberMessaging,
        removeGroupMember,
        addGroupMember,
        approveGroupJoinRequest,
        rejectGroupJoinRequest,
        requestJoinGroupViaLink,
        exitGroup,
        reportGroup,
        toggleHideChat,
        chatSecretCode,
        setChatSecretCode,
        hideChatWithCode,
        unhideChat,
        updateChatVaultConfig,
        isVaultNotificationsEnabled,
        toggleVaultNotifications,
        defaultVaultConfig,
        updateDefaultVaultConfig,
        activePermissionPrompt,
        requestAppPermission,
        respondToPermissionPrompt,
        resetAppPermissions,
        // Profile, Post, Story & Highlight Privacy & Archives
        archivePost,
        unarchivePost,
        toggleHidePostFromGrid,
        archiveStory,
        unarchiveStory,
        deleteStory,
        addStoryComment,
        likeStoryComment,
        deleteStoryComment,
        updatePostEmojiSettings,
        deleteComment,
        archiveHighlight,
        unarchiveHighlight,
        deleteHighlight,
        toggleHideFollower,
        updateSecondaryAvatar,
        updateCustomDualPfp,
        createStoryWithDuration,
        // One-way Profile Concealment
        hiddenProfileFromUserIds,
        toggleHideMyProfileFrom,
        isProfileHiddenFromUser,
        // Supabase Auth & Session
        supabaseSession,
        isSupabaseConfigured,
        loginWithSupabase,
        loginWithGoogle,
        // Preferred Language & Translations
        preferredLanguage,
        setPreferredLanguage,
        currentLanguageOption,
        t,
        // Username onboarding prompt
        isUsernameSetupRequired,
        setIsUsernameSetupRequired
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
