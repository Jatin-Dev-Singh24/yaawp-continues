// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef } from 'react';
import {
  X,
  Bookmark,
  Heart,
  Eye,
  MessageCircle,
  Archive,
  Shield,
  Lock,
  Users,
  Film,
  Clock,
  UserX,
  Key,
  Download,
  LogOut,
  ChevronRight,
  Settings,
  Camera,
  Check,
  Globe,
  Trash2,
  Search,
  Sliders,
  ChevronLeft,
  Share2,
  Sparkles,
  Sun,
  Moon,
  Plus,
  UserCheck,
  Palette,
  Upload
} from 'lucide-react';
import { useApp, AppThemePreset, LIGHT_THEMES } from '../context/AppContext';
import { convertImageToWebP } from '../utils/mediaConverter';
import { INITIAL_LANGUAGES, getLanguageByCode } from '../translations';
import { ChangeSecretCodeModal } from './chat/ChangeSecretCodeModal';
import { CustomPfpConfig, AvatarAudience } from '../types';

export const ProfileSettingsModal: React.FC = () => {
  const {
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    currentUser,
    theme,
    systemTheme,
    setSystemTheme,
    toggleTheme,
    posts,
    reels,
    openLegalModal,
    setIsSecurityModalOpen,
    setIsCreateAccountModalOpen,
    exportUserData,
    signOutAccount,
    showToast,
    isAccountPrivate,
    toggleAccountPrivacy,
    isFollowersPrivate,
    toggleFollowersPrivacy,
    setSelectedPostForModal,
    archivePost,
    unarchivePost,
    toggleHidePostFromGrid,
    updateSecondaryAvatar,
    updateCustomDualPfp,
    allUsers,
    toggleHideFollower,
    hiddenProfileFromUserIds,
    toggleHideMyProfileFrom,
    preferredLanguage,
    setPreferredLanguage,
    currentLanguageOption,
    t
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<
    | 'main'
    | 'saved'
    | 'liked'
    | 'watched'
    | 'commented'
    | 'archive'
    | 'dual_avatar'
    | 'followers_privacy'
    | 'privacy_policy'
    | 'story_settings'
    | 'hide_profile_from'
    | 'language'
  >('main');

  const [searchQuery, setSearchQuery] = useState('');
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [storyDuration, setStoryDuration] = useState<'24h' | '48h'>('48h');
  const [messageRestriction, setMessageRestriction] = useState<'everyone' | 'connections' | 'none'>('connections');
  const [hiddenFollowers, setHiddenFollowers] = useState<string[]>([]);
  const [showChangeSecretCodeModal, setShowChangeSecretCodeModal] = useState<boolean>(false);

  // Active theme tab inside Settings: 'bright' | 'dark'
  const isCurrentThemeLight = LIGHT_THEMES.includes(systemTheme) || theme === 'light';
  const [themeTab, setThemeTab] = useState<'bright' | 'dark'>(() => (isCurrentThemeLight ? 'bright' : 'dark'));

  // Dual Custom Profile Picture State (Both are custom PFPs configurable by the user)
  const [activePfpTab, setActivePfpTab] = useState<'pfp1' | 'pfp2'>('pfp1');
  const [pfp1, setPfp1] = useState<CustomPfpConfig>(() => {
    if (currentUser.pfp1Config) return currentUser.pfp1Config;
    return {
      id: 'pfp_custom_1',
      label: 'Profile Picture 1',
      url: currentUser.avatar || '',
      hasNoPfp: false,
      audience: 'everyone',
      customUserIds: [],
      customUsernames: []
    };
  });

  const [pfp2, setPfp2] = useState<CustomPfpConfig>(() => {
    if (currentUser.pfp2Config) return currentUser.pfp2Config;
    return {
      id: 'pfp_custom_2',
      label: 'Profile Picture 2',
      url: currentUser.secondaryAvatar || '',
      hasNoPfp: false,
      audience: 'close_friends',
      customUserIds: [],
      customUsernames: []
    };
  });

  // Random/unlisted user text input for custom audience
  const [unlistedUsernameInput, setUnlistedUsernameInput] = useState('');

  if (!isProfileMenuOpen) return null;

  // Filter items for subviews
  const savedPosts = posts.filter(p => p.isSaved);
  const likedPosts = posts.filter(p => p.isLiked);
  const commentedPosts = posts.filter(p => p.comments.some(c => c.user.id === currentUser.id));
  const watchedReels = reels.slice(0, 4);

  const handleToggleHideFollowerItem = (userId: string) => {
    setHiddenFollowers(prev => {
      const exists = prev.includes(userId);
      const next = exists ? prev.filter(id => id !== userId) : [...prev, userId];
      showToast(exists ? 'Follower unhidden from public list' : 'Follower hidden from public list');
      return next;
    });
    toggleHideFollower?.(userId, 'follower');
  };

  const handleSaveDualPfp = () => {
    updateCustomDualPfp(pfp1, pfp2);
    showToast('Dual custom profile picture rules saved successfully!');
  };

  const currentActiveConfig = activePfpTab === 'pfp1' ? pfp1 : pfp2;
  const setCurrentActiveConfig = (updater: (prev: CustomPfpConfig) => CustomPfpConfig) => {
    if (activePfpTab === 'pfp1') {
      setPfp1(prev => updater(prev));
    } else {
      setPfp2(prev => updater(prev));
    }
  };

  const handleAddUnlistedUser = () => {
    const cleaned = unlistedUsernameInput.trim().replace(/^@/, '').toLowerCase();
    if (!cleaned) return;
    setCurrentActiveConfig(prev => {
      const currentList = prev.customUsernames || [];
      if (currentList.includes(cleaned)) {
        showToast(`@${cleaned} is already added`);
        return prev;
      }
      showToast(`Added @${cleaned} to custom viewers`);
      return {
        ...prev,
        customUsernames: [...currentList, cleaned]
      };
    });
    setUnlistedUsernameInput('');
  };

  const handleRemoveUnlistedUser = (username: string) => {
    setCurrentActiveConfig(prev => ({
      ...prev,
      customUsernames: (prev.customUsernames || []).filter(u => u !== username)
    }));
  };

  const profilePfpFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePfpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await convertImageToWebP(file);
      setCurrentActiveConfig(prev => ({ ...prev, url: result.dataUrl, hasNoPfp: false }));
      showToast('Profile picture uploaded from device!');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setCurrentActiveConfig(prev => ({ ...prev, url: res, hasNoPfp: false }));
        showToast('Profile picture uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleListedUser = (userId: string) => {
    setCurrentActiveConfig(prev => {
      const list = prev.customUserIds || [];
      const exists = list.includes(userId);
      return {
        ...prev,
        customUserIds: exists ? list.filter(id => id !== userId) : [...list, userId]
      };
    });
  };

  // Bright and Dark Theme Presets
  const brightThemesList = [
    {
      id: 'light' as AppThemePreset,
      name: 'Clean Daylight',
      desc: 'Minimal crisp white & slate',
      bgPreview: 'bg-white border-slate-300',
      accent: 'bg-slate-900'
    },
    {
      id: 'nordic' as AppThemePreset,
      name: 'Nordic Frost',
      desc: 'Cool daylight blue-gray',
      bgPreview: 'bg-[#f4f7fb] border-sky-300',
      accent: 'bg-sky-600'
    },
    {
      id: 'porcelain' as AppThemePreset,
      name: 'Porcelain Warm',
      desc: 'Sunlit warm cream & ivory',
      bgPreview: 'bg-[#fdfbf7] border-amber-200',
      accent: 'bg-amber-600'
    },
    {
      id: 'mint_light' as AppThemePreset,
      name: 'Mint Blossom',
      desc: 'Fresh sage & pistachio',
      bgPreview: 'bg-[#f2faf5] border-emerald-300',
      accent: 'bg-emerald-600'
    },
    {
      id: 'rose_light' as AppThemePreset,
      name: 'Blush Quartz',
      desc: 'Soft champagne & rose',
      bgPreview: 'bg-[#fdf4f5] border-rose-300',
      accent: 'bg-rose-500'
    }
  ];

  const darkThemesList = [
    {
      id: 'dark' as AppThemePreset,
      name: 'Classic Dark',
      desc: 'Modern deep charcoal',
      bgPreview: 'bg-[#121212] border-zinc-700',
      accent: 'bg-zinc-300'
    },
    {
      id: 'midnight' as AppThemePreset,
      name: 'Midnight Slate',
      desc: 'Deep modern navy slate',
      bgPreview: 'bg-[#0b1120] border-slate-700',
      accent: 'bg-sky-400'
    },
    {
      id: 'obsidian' as AppThemePreset,
      name: 'Obsidian OLED',
      desc: 'Pure True AMOLED Black',
      bgPreview: 'bg-black border-zinc-800',
      accent: 'bg-zinc-400'
    },
    {
      id: 'cyber' as AppThemePreset,
      name: 'Cyber Indigo',
      desc: 'Futuristic neon glow',
      bgPreview: 'bg-[#060714] border-indigo-900',
      accent: 'bg-indigo-500'
    },
    {
      id: 'sunset' as AppThemePreset,
      name: 'Sunset Ember',
      desc: 'Warm terracotta espresso',
      bgPreview: 'bg-[#120905] border-amber-900',
      accent: 'bg-amber-500'
    },
    {
      id: 'emerald' as AppThemePreset,
      name: 'Emerald Forest',
      desc: 'Deep pine & sage green',
      bgPreview: 'bg-[#03120e] border-emerald-900',
      accent: 'bg-emerald-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-xs p-2 md:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[700px] text-slate-900 dark:text-zinc-100 transition-colors">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/90 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            {activeSubView !== 'main' && (
              <button
                onClick={() => setActiveSubView('main')}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Back to Settings"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-lime-500 dark:text-lime-400" />
              <span>
                {activeSubView === 'main'
                  ? 'Settings and activity'
                  : activeSubView === 'language'
                  ? 'Preferred Language'
                  : activeSubView === 'saved'
                  ? 'Saved Posts'
                  : activeSubView === 'liked'
                  ? 'Liked Posts'
                  : activeSubView === 'watched'
                  ? 'Watched Reels'
                  : activeSubView === 'commented'
                  ? 'Commented Posts'
                  : activeSubView === 'archive'
                  ? 'Archive & Trash'
                  : activeSubView === 'dual_avatar'
                  ? 'Dual Profile Pictures'
                  : activeSubView === 'followers_privacy'
                  ? 'Followers Privacy & Hidden'
                  : activeSubView === 'hide_profile_from'
                  ? 'Hide my profile from'
                  : activeSubView === 'story_settings'
                  ? 'Story & Message Settings'
                  : 'Privacy & Policy'}
              </span>
            </h2>
          </div>

          <button
            onClick={() => {
              setIsProfileMenuOpen(false);
              setActiveSubView('main');
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 text-slate-800 dark:text-zinc-200">
          {activeSubView === 'main' && (
            <>
              {/* Search Bar in Settings */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search settings..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-lime-500 transition-colors"
                />
              </div>

              {/* Section 1: How you interact */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider px-1">
                  How you interact
                </p>
                <div className="bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl divide-y divide-slate-200/90 dark:divide-zinc-800/60 overflow-hidden">
                  <button
                    onClick={() => setActiveSubView('saved')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="w-4 h-4 text-lime-500 dark:text-lime-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Saved</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">{savedPosts.length} saved bookmarks</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('liked')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Liked</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">{likedPosts.length} posts you liked</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('watched')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Film className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Watched</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Reels viewing history</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('commented')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Commented</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">{commentedPosts.length} posts you participated in</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('archive')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Archive className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Archive</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Archived posts, stories & highlights</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Section 2: Who can see your content */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider px-1">
                  Who can see your content
                </p>
                <div className="bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl divide-y divide-slate-200/90 dark:divide-zinc-800/60 overflow-hidden">
                  <div className="p-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Private Account</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Only approved followers can see your posts and stories</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleAccountPrivacy}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        isAccountPrivate ? 'bg-lime-500 dark:bg-lime-400 justify-end' : 'bg-slate-300 dark:bg-zinc-800 justify-start'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full shadow-md ${isAccountPrivate ? 'bg-white dark:bg-zinc-950' : 'bg-white dark:bg-zinc-400'}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveSubView('dual_avatar')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Dual Custom Profile Pictures</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Configurable PFPs, custom users & no-pfp modes</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('followers_privacy')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Followers & Following Privacy</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Hide specific people from lists or conceal counts</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    id="settings-hide-profile-from-btn"
                    onClick={() => setActiveSubView('hide_profile_from')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <UserX className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                          Hide my profile from
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          One-way profile concealment ({hiddenProfileFromUserIds.length} hidden)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('story_settings')}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Story & Message Settings</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Lifespan (24h/48h) & message restrictions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    id="settings-language-menu-btn"
                    onClick={() => setActiveSubView('language')}
                    className="w-full p-3.5 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 group-hover:scale-105 transition-transform">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Preferred Language</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-500/30">
                            30 Languages
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          Current: <strong className="text-indigo-600 dark:text-indigo-400 font-medium">{currentLanguageOption.nativeName}</strong> ({currentLanguageOption.name})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                        {currentLanguageOption.nativeName}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 transition-colors" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Section: Appearance & Balanced Theme Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Appearance & Display
                  </p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 capitalize">
                    {systemTheme}
                  </span>
                </div>

                <div className="bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl p-4 space-y-4">
                  {/* Active theme overview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl transition-colors ${
                          theme === 'dark'
                            ? 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/50'
                            : 'bg-amber-100 text-amber-600 border border-amber-300 dark:bg-amber-400/20 dark:text-amber-400 dark:border-amber-500/30'
                        }`}
                      >
                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {theme === 'dark' ? 'Dark Atmosphere' : 'Bright Atmosphere'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Applied across your whole app, settings, and menus
                        </p>
                      </div>
                    </div>

                    {/* Quick Light/Dark Toggle */}
                    <button
                      id="settings-theme-switcher-btn"
                      type="button"
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        theme === 'dark' ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                      role="switch"
                      aria-checked={theme === 'dark'}
                      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Balanced Theme Palette Switcher: Bright vs Dark tabs */}
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
                        <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                          Curated Atmospheric Palettes
                        </p>
                      </div>

                      {/* Theme Category Switcher */}
                      <div className="flex rounded-lg p-0.5 bg-slate-200 dark:bg-zinc-800/90 text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setThemeTab('bright')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            themeTab === 'bright'
                              ? 'bg-white text-slate-900 shadow-xs font-bold'
                              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Bright ({brightThemesList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setThemeTab('dark')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            themeTab === 'dark'
                              ? 'bg-zinc-900 dark:bg-zinc-700 text-white shadow-xs font-bold'
                              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Dark ({darkThemesList.length})
                        </button>
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {(themeTab === 'bright' ? brightThemesList : darkThemesList).map(t => {
                        const isSelected = systemTheme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSystemTheme(t.id);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? 'border-lime-500 bg-lime-50 dark:bg-zinc-900/90 shadow-sm ring-1 ring-lime-500/50'
                                : 'border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className={`w-5 h-5 rounded-lg border shadow-xs flex items-center justify-center ${t.bgPreview}`}>
                                <div className={`w-2 h-2 rounded-full ${t.accent}`} />
                              </div>
                              {isSelected && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-lime-600 dark:text-lime-400">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                              {t.name}
                            </p>
                            <p className="text-[9px] text-slate-500 dark:text-zinc-400 truncate">
                              {t.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Privacy, Policy & Security */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider px-1">
                  Privacy, Policy & Security
                </p>
                <div className="bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl divide-y divide-slate-200/90 dark:divide-zinc-800/60 overflow-hidden">
                  <button
                    id="settings-shield-privacy-btn"
                    onClick={() => openLegalModal('privacy')}
                    className="w-full p-3.5 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-lime-100 dark:bg-lime-400/10 text-lime-600 dark:text-lime-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                          Privacy Policy & Legal Agreements
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Review Yaawp terms, cookie policies & GDPR rights
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSecurityModalOpen(true);
                    }}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Security Suite & Passcode</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Two-Factor Authentication & Audit Logs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Section 4: Login & Account Management */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider px-1">
                  Login & Account
                </p>
                <div className="bg-slate-50/90 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl divide-y divide-slate-200/90 dark:divide-zinc-800/60 overflow-hidden">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsCreateAccountModalOpen(true);
                    }}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Add or Switch Account</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Login to another persona or create a brand page</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={exportUserData}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Download Your Information</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Get an offline JSON copy of your profile & media</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </button>

                  <button
                    onClick={signOutAccount}
                    className="w-full p-3 px-4 flex items-center justify-between hover:bg-rose-100/60 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <div>
                        <p className="text-xs font-bold">Log Out @{currentUser.username}</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SubView: Preferred Language Selection (30 Languages) */}
          {activeSubView === 'language' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-start gap-3">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">Choose your preferred language</p>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Select any of the 30 languages below. The interface will immediately update to your chosen language.
                  </p>
                </div>
              </div>

              {/* Language Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <input
                  id="settings-language-search-input"
                  type="text"
                  value={languageSearchQuery}
                  onChange={e => setLanguageSearchQuery(e.target.value)}
                  placeholder="Search by English or native name (e.g., Español, हिन्दी)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {languageSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLanguageSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Languages List */}
              <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
                {INITIAL_LANGUAGES.filter(lang => {
                  const q = languageSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    lang.name.toLowerCase().includes(q) ||
                    lang.nativeName.toLowerCase().includes(q) ||
                    lang.code.toLowerCase().includes(q)
                  );
                }).map(lang => {
                  const isSelected = preferredLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      id={`settings-lang-${lang.code}`}
                      type="button"
                      onClick={() => {
                        setPreferredLanguage(lang.code);
                        showToast(`Language updated to ${lang.nativeName} (${lang.name})`);
                      }}
                      className={`w-full p-3 px-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-slate-900 dark:text-white ring-1 ring-indigo-500/40 shadow-xs'
                          : 'bg-white dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-800 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
                            {lang.nativeName}
                          </span>
                          {lang.dir === 'rtl' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 font-mono">
                              RTL
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/50 font-semibold">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {lang.name}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SubView: Saved Posts */}
          {activeSubView === 'saved' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Only you can see what you've saved.
              </p>
              {savedPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {savedPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setSelectedPostForModal(post);
                      }}
                      className="aspect-square bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 relative group"
                    >
                      <img src={post.mediaUrls[0]} alt={post.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-lime-400 fill-lime-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-zinc-500 text-xs">
                  No saved posts yet.
                </div>
              )}
            </div>
          )}

          {/* SubView: Liked Posts */}
          {activeSubView === 'liked' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Posts and photos you've given a heart to.
              </p>
              {likedPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {likedPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setSelectedPostForModal(post);
                      }}
                      className="aspect-square bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 relative group"
                    >
                      <img src={post.mediaUrls[0]} alt={post.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-zinc-500 text-xs">
                  No liked posts yet.
                </div>
              )}
            </div>
          )}

          {/* SubView: Watched Reels */}
          {activeSubView === 'watched' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Recently viewed short-form video reels.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {watchedReels.map(reel => (
                  <div key={reel.id} className="relative aspect-[9/16] bg-slate-200 dark:bg-zinc-800 rounded-2xl overflow-hidden group">
                    <img src={reel.thumbnailUrl} alt={reel.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-3 flex flex-col justify-between">
                      <span className="text-[10px] bg-black/70 text-lime-400 px-2 py-0.5 rounded-md font-mono self-start">
                        {reel.durationSeconds}s
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white line-clamp-1">{reel.caption}</p>
                        <p className="text-[10px] text-zinc-300">@{reel.user.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubView: Commented */}
          {activeSubView === 'commented' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Posts where you left a comment or joined a discussion.
              </p>
              {commentedPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {commentedPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setSelectedPostForModal(post);
                      }}
                      className="aspect-square bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 relative group"
                    >
                      <img src={post.mediaUrls[0]} alt={post.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-sky-400 fill-sky-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-zinc-500 text-xs">
                  No commented posts yet.
                </div>
              )}
            </div>
          )}

          {/* SubView: Archive & Trash */}
          {activeSubView === 'archive' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Archived Content</h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Only you can see the posts, stories and highlights you've archived. Archiving hides content from your profile without deleting its likes and comments.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Your Posts in Archive</p>
                <div className="grid grid-cols-3 gap-2">
                  {posts.slice(0, 3).map(post => (
                    <div key={post.id} className="aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800 relative group">
                      <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                        <button
                          onClick={() => {
                            unarchivePost(post.id);
                            showToast('Restored post to profile grid');
                          }}
                          className="px-2 py-1 rounded bg-lime-400 text-zinc-950 font-bold text-[10px]"
                        >
                          Show on Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SubView: Dual Custom Profile Pictures */}
          {activeSubView === 'dual_avatar' && (
            <div className="space-y-4">
              {/* Informational Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Dual Custom Profile Pictures
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Configure two distinct custom profile pictures based on exactly who you want to show what. Both pictures support custom individual audience selection (including unlisted random handles) and an option to opt for <strong>No Profile Picture</strong>.
                </p>
              </div>

              {/* Tabs for Picture 1 vs Picture 2 */}
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActivePfpTab('pfp1')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePfpTab === 'pfp1'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-lime-500" />
                  <span>Profile Picture 1</span>
                  {pfp1.hasNoPfp && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                      No PFP
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePfpTab('pfp2')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePfpTab === 'pfp2'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Profile Picture 2</span>
                  {pfp2.hasNoPfp && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                      No PFP
                    </span>
                  )}
                </button>
              </div>

              {/* Active Configured PFP Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-4">
                {/* Visual Avatar Preview & No PFP Toggle */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    {currentActiveConfig.hasNoPfp ? (
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-900 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                        <UserX className="w-7 h-7" />
                        <span className="text-[9px] font-bold mt-0.5">No PFP</span>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-lime-500 dark:ring-lime-400 bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                        {currentActiveConfig.url ? (
                          <img
                            src={currentActiveConfig.url}
                            alt={currentActiveConfig.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-slate-500">
                            {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentActiveConfig.label}
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold capitalize">
                        Audience: {currentActiveConfig.audience.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {currentActiveConfig.hasNoPfp
                        ? 'Users in this audience will see a blank default profile placeholder.'
                        : 'Shown to selected audience when they visit or interact with your profile.'}
                    </p>

                    {/* Opt for No PFP Button */}
                    <div className="pt-1 flex items-center justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentActiveConfig(prev => ({ ...prev, hasNoPfp: !prev.hasNoPfp }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                          currentActiveConfig.hasNoPfp
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                            : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-800 hover:border-amber-400'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>{currentActiveConfig.hasNoPfp ? 'Opted for No PFP (Enabled)' : 'Opt for No PFP'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Avatar Image URL & Device File Selection */}
                <input
                  ref={profilePfpFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePfpFileChange}
                />

                {!currentActiveConfig.hasNoPfp && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                        {currentActiveConfig.label} Photo
                      </label>
                      <button
                        type="button"
                        onClick={() => profilePfpFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Select from Device</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentActiveConfig.url || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setCurrentActiveConfig(prev => ({ ...prev, url: val }));
                      }}
                      placeholder="Or enter direct image URL..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Audience Rule Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    Who can see this {currentActiveConfig.label}?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'everyone' as AvatarAudience, label: 'Everyone', desc: 'All viewers' },
                      { id: 'followers' as AvatarAudience, label: 'Followers', desc: 'Approved followers' },
                      { id: 'close_friends' as AvatarAudience, label: 'Close Friends', desc: 'Close circle only' },
                      { id: 'custom' as AvatarAudience, label: 'Custom Users', desc: 'Pick specific users' }
                    ].map(aud => {
                      const isSelected = currentActiveConfig.audience === aud.id;
                      return (
                        <button
                          key={aud.id}
                          type="button"
                          onClick={() =>
                            setCurrentActiveConfig(prev => ({ ...prev, audience: aud.id }))
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-lime-500 bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400 ring-1 ring-lime-500/40'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                          }`}
                        >
                          <p className="text-xs font-bold">{aud.label}</p>
                          <p className="text-[9px] opacity-80">{aud.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Users Picker (both platform users and unlisted random users) */}
                {currentActiveConfig.audience === 'custom' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-lime-500" />
                        <span>Select Custom Users & Add Unlisted Handles</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Choose listed friends below or add any external/unlisted usernames manually.
                      </p>
                    </div>

                    {/* Add Unlisted Random User Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                          @
                        </span>
                        <input
                          type="text"
                          value={unlistedUsernameInput}
                          onChange={e => setUnlistedUsernameInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUnlistedUser();
                            }
                          }}
                          placeholder="Type unlisted user handle (e.g. alex_runner)..."
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddUnlistedUser}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Selected Custom Viewers List (Badges) */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Active Custom Viewers (
                        {(currentActiveConfig.customUserIds?.length || 0) +
                          (currentActiveConfig.customUsernames?.length || 0)}
                        )
                      </p>

                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                        {(!currentActiveConfig.customUserIds?.length &&
                          !currentActiveConfig.customUsernames?.length) && (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                            No custom viewers selected yet. Add handles above or check platform users below.
                          </span>
                        )}

                        {/* Listed platform users selected */}
                        {currentActiveConfig.customUserIds?.map(userId => {
                          const user = allUsers.find(u => u.id === userId);
                          if (!user) return null;
                          return (
                            <span
                              key={userId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-100 dark:bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-300 dark:border-lime-500/30 text-[11px] font-semibold"
                            >
                              <img src={user.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                              <span>@{user.username}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleListedUser(userId)}
                                className="hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}

                        {/* Unlisted random users added */}
                        {currentActiveConfig.customUsernames?.map(username => (
                          <span
                            key={username}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 text-[11px] font-semibold"
                          >
                            <span>@{username}</span>
                            <span className="text-[9px] opacity-70 font-normal">(unlisted)</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUnlistedUser(username)}
                              className="hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Platform users list to quick toggle */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Platform Users Quick Selection:
                      </p>
                      <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1">
                        {allUsers
                          .filter(u => u.id !== currentUser.id)
                          .map(u => {
                            const isChecked = currentActiveConfig.customUserIds?.includes(u.id);
                            return (
                              <div
                                key={u.id}
                                onClick={() => handleToggleListedUser(u.id)}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                  <div>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                                      {u.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">@{u.username}</p>
                                  </div>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? 'bg-lime-500 border-lime-500 text-white'
                                      : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button for Dual Profile Pictures */}
              <button
                type="button"
                onClick={handleSaveDualPfp}
                className="w-full py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
              >
                Save Both Custom Profile Pictures
              </button>
            </div>
          )}

          {/* SubView: Followers & Following Privacy */}
          {activeSubView === 'followers_privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hide Follower & Following Lists</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Prevent other users from clicking and viewing who you follow</p>
                </div>
                <button
                  onClick={toggleFollowersPrivacy}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isFollowersPrivate ? 'bg-lime-500 dark:bg-lime-400 justify-end' : 'bg-slate-300 dark:bg-zinc-800 justify-start'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full shadow-md ${isFollowersPrivate ? 'bg-white dark:bg-zinc-950' : 'bg-white dark:bg-zinc-400'}`} />
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Select Specific Followers to Conceal from Your Public Profile:
                </p>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-950 p-1">
                  {allUsers
                    .filter(u => u.id !== currentUser.id)
                    .map(user => {
                      const isHidden = hiddenFollowers.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400">@{user.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleHideFollowerItem(user.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                              isHidden
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30'
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {isHidden ? 'Concealed' : 'Conceal'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* SubView: Story Duration Settings */}
          {activeSubView === 'story_settings' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Story Lifespan Duration</h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Standard stories disappear after 24 hours. Extend your stories up to 48 hours for weekend coverage, travel logs, and conferences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setStoryDuration('24h');
                    showToast('Stories duration set to standard 24 hours');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    storyDuration === '24h'
                      ? 'border-lime-500 bg-lime-50 dark:bg-lime-400/10 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400 mb-1" />
                  <p className="text-xs font-bold">Standard 24h</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">Default disappearance</p>
                </button>

                <button
                  onClick={() => {
                    setStoryDuration('48h');
                    showToast('Stories duration extended to 48 hours!');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    storyDuration === '48h'
                      ? 'border-lime-500 bg-lime-50 dark:bg-lime-400/10 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-lime-500 dark:text-lime-400 mb-1" />
                  <p className="text-xs font-bold text-lime-600 dark:text-lime-400">Extended 48h</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Keeps active for 2 full days</p>
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Message Restrictions & Story Replies
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['everyone', 'connections', 'none'] as const).map(res => (
                    <button
                      key={res}
                      onClick={() => {
                        setMessageRestriction(res);
                        showToast(`Story replies restricted to: ${res}`);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        messageRestriction === res
                          ? 'border-lime-500 bg-lime-50 dark:bg-lime-400/10 text-lime-700 dark:text-lime-400'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SubView: Hide My Profile From */}
          {activeSubView === 'hide_profile_from' && (
            <div className="p-4 space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 text-xs">
                  <UserX className="w-4 h-4 shrink-0" />
                  <span>One-Way Profile Concealment</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700/80 dark:text-rose-200/80">
                  People you choose here cannot see your profile, posts, reels, or stories. When they visit your profile, it will show as <strong>"Profile Unavailable"</strong>. However, you can still view their profile normally.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by username or name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-rose-400/60"
                />
              </div>

              {/* Hidden users section */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  Currently Hidden ({hiddenProfileFromUserIds.length})
                </p>

                {hiddenProfileFromUserIds.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-500 text-xs">
                    You haven't hidden your profile from anyone yet. Search below to add someone.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {allUsers
                      .filter(u => hiddenProfileFromUserIds.includes(u.id))
                      .map(u => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-rose-200 dark:border-rose-900/30"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.username}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-500/40"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <span>{u.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                  Blocked
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">@{u.username}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleHideMyProfileFrom(u.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
                          >
                            Unhide
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Available users list */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  Add People to Hide List
                </p>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {allUsers
                    .filter(u => u.id !== currentUser.id)
                    .filter(
                      u =>
                        !searchQuery ||
                        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(u => {
                      const isHidden = hiddenProfileFromUserIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">@{u.username}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleHideMyProfileFrom(u.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isHidden
                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 hover:bg-rose-200'
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-rose-600 hover:text-white'
                            }`}
                          >
                            {isHidden ? 'Hidden' : 'Hide Profile'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChangeSecretCodeModal
        isOpen={showChangeSecretCodeModal}
        onClose={() => setShowChangeSecretCodeModal(false)}
      />
    </div>
  );
};
