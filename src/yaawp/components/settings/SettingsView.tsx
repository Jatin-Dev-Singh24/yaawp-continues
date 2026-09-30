// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef } from 'react';
import { useNavigate } from '@/yaawp/compat/router';
import {
  Palette,
  Camera,
  Shield,
  Lock,
  Eye,
  Globe,
  Archive,
  Bookmark,
  Heart,
  Film,
  MessageCircle,
  Users,
  ChevronRight,
  Sun,
  Moon,
  Check,
  Search,
  Key,
  Download,
  LogOut,
  UserPlus,
  Sliders,
  Sparkles,
  ExternalLink,
  Trash2,
  FileText,
  UserCheck,
  Plus,
  Clock,
  UserX,
  AlertTriangle,
  Upload,
  X,
  ChevronDown
} from 'lucide-react';
import { useApp, AppThemePreset, LIGHT_THEMES } from '../../context/AppContext';
import { convertImageToWebP } from '../../utils/mediaConverter';
import { INITIAL_LANGUAGES, getLanguageByCode } from '../../translations';
import { CustomPfpConfig, AvatarAudience } from '../../types';
import { ChangeSecretCodeModal } from '../chat/ChangeSecretCodeModal';

type SettingsSection =
  | 'appearance'
  | 'dual_avatar'
  | 'security'
  | 'privacy'
  | 'language'
  | 'activity'
  | 'legal'
  | 'account';

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    theme,
    systemTheme,
    setSystemTheme,
    toggleTheme,
    posts,
    reels,
    openLegalModal,
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
    updateCustomDualPfp,
    allUsers,
    hiddenProfileFromUserIds,
    toggleHideMyProfileFrom,
    preferredLanguage,
    setPreferredLanguage,
    currentLanguageOption,
    setActiveTab,
    securitySettings,
    updateSecuritySettings,
    deactivateAccount,
    t
  } = useApp();

  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [activitySubTab, setActivitySubTab] = useState<'saved' | 'liked' | 'archive' | 'watched' | 'commented'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [storyDuration, setStoryDuration] = useState<'24h' | '48h'>('48h');
  const [messageRestriction, setMessageRestriction] = useState<'everyone' | 'connections' | 'none'>('connections');
  const [showChangeSecretCodeModal, setShowChangeSecretCodeModal] = useState(false);

  // Deactivate Account modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('Just need a break');
  const [deactivatePassword, setDeactivatePassword] = useState('');

  // Security Passcode State
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Theme tab: Bright vs Dark presets
  const isCurrentThemeLight = LIGHT_THEMES.includes(systemTheme) || theme === 'light';
  const [themeTab, setThemeTab] = useState<'bright' | 'dark'>(() => (isCurrentThemeLight ? 'bright' : 'dark'));

  // Dual Custom Profile Picture State
  const [activePfpTab, setActivePfpTab] = useState<'pfp1' | 'pfp2'>('pfp1');
  const [isPfpDropdownOpen, setIsPfpDropdownOpen] = useState(false);
  const pfpFileInputRef = useRef<HTMLInputElement>(null);

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

  const [customUserSearch, setCustomUserSearch] = useState('');

  const handlePfpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await convertImageToWebP(file);
      if (activePfpTab === 'pfp1') {
        setPfp1(prev => ({ ...prev, url: result.dataUrl, hasNoPfp: false }));
      } else {
        setPfp2(prev => ({ ...prev, url: result.dataUrl, hasNoPfp: false }));
      }
      showToast(`Photo uploaded for ${activePfpTab === 'pfp1' ? 'Primary' : 'Secondary'} profile picture!`);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        if (activePfpTab === 'pfp1') {
          setPfp1(prev => ({ ...prev, url: res, hasNoPfp: false }));
        } else {
          setPfp2(prev => ({ ...prev, url: res, hasNoPfp: false }));
        }
        showToast('Photo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCustomUser = (targetUserId: string, targetUsername: string) => {
    if (activePfpTab === 'pfp1') {
      setPfp1(prev => {
        const exists = prev.customUserIds?.includes(targetUserId);
        const nextIds = exists
          ? (prev.customUserIds || []).filter(id => id !== targetUserId)
          : [...(prev.customUserIds || []), targetUserId];
        const nextNames = exists
          ? (prev.customUsernames || []).filter(u => u !== targetUsername)
          : [...(prev.customUsernames || []), targetUsername];
        return { ...prev, customUserIds: nextIds, customUsernames: nextNames };
      });
    } else {
      setPfp2(prev => {
        const exists = prev.customUserIds?.includes(targetUserId);
        const nextIds = exists
          ? (prev.customUserIds || []).filter(id => id !== targetUserId)
          : [...(prev.customUserIds || []), targetUserId];
        const nextNames = exists
          ? (prev.customUsernames || []).filter(u => u !== targetUsername)
          : [...(prev.customUsernames || []), targetUsername];
        return { ...prev, customUserIds: nextIds, customUsernames: nextNames };
      });
    }
  };

  // Handle saving dual PFP config
  const handleSaveDualPfp = () => {
    updateCustomDualPfp(pfp1, pfp2);
    showToast('Dual Profile Picture configuration saved!');
  };

  // Activity items
  const savedPosts = posts.filter(p => p.isSaved);
  const likedPosts = posts.filter(p => p.isLiked);
  const archivedPosts = posts.filter(p => p.isArchived);

  // Themes list with vivid colors
  const brightThemes: {
    id: AppThemePreset;
    name: string;
    desc: string;
    bg: string;
    card: string;
    border: string;
    accent: string;
    text: string;
  }[] = [
    {
      id: 'light',
      name: 'Sunlight Day',
      desc: 'Clean pure daylight with crisp indigo accents',
      bg: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
      accent: '#4f46e5',
      text: '#0f172a'
    },
    {
      id: 'nordic',
      name: 'Nordic Fjord',
      desc: 'Scandinavian arctic ice with royal blue tones',
      bg: '#edf3f8',
      card: '#f8fbfe',
      border: '#c4d8ec',
      accent: '#2563eb',
      text: '#0f172a'
    },
    {
      id: 'porcelain',
      name: 'Porcelain Pure',
      desc: 'Warm sunlit alabaster & antique amber sepia',
      bg: '#faf6ee',
      card: '#fffefb',
      border: '#decfae',
      accent: '#b45309',
      text: '#292524'
    },
    {
      id: 'mint_light',
      name: 'Mint Crisp',
      desc: 'Fresh eucalyptus & botanic spearmint dew',
      bg: '#ecfbf2',
      card: '#f8fef9',
      border: '#a8e6be',
      accent: '#059669',
      text: '#064e3b'
    },
    {
      id: 'rose_light',
      name: 'Rose Blossom',
      desc: 'Soft champagne peony & delicate rose quartz',
      bg: '#fdf2f4',
      card: '#fffbfb',
      border: '#f4b3c0',
      accent: '#e11d48',
      text: '#4c0519'
    }
  ];

  const darkThemes: {
    id: AppThemePreset;
    name: string;
    desc: string;
    bg: string;
    card: string;
    border: string;
    accent: string;
    text: string;
  }[] = [
    {
      id: 'dark',
      name: 'Cyber Lime',
      desc: 'Classic Yaawp deep slate with cyber lime punch',
      bg: '#09090b',
      card: '#18181b',
      border: '#3f3f46',
      accent: '#a3e635',
      text: '#f4f4f5'
    },
    {
      id: 'midnight',
      name: 'Midnight Navy',
      desc: 'Deep oceanic royal navy & brilliant sapphire glow',
      bg: '#050c1e',
      card: '#0c1d42',
      border: '#1d418f',
      accent: '#38bdf8',
      text: '#e0f2fe'
    },
    {
      id: 'obsidian',
      name: 'Obsidian OLED',
      desc: 'True pitch black OLED with titanium white contrast',
      bg: '#000000',
      card: '#0a0a0c',
      border: '#27272a',
      accent: '#ffffff',
      text: '#ffffff'
    },
    {
      id: 'cyber',
      name: 'Cyberpunk Violet',
      desc: 'Electric neon indigo, violet nebula & cyan laser',
      bg: '#060719',
      card: '#0f1330',
      border: '#262f74',
      accent: '#818cf8',
      text: '#e0e7ff'
    },
    {
      id: 'sunset',
      name: 'Sunset Ember',
      desc: 'Volcanic terracotta, scorched dusk & flame copper',
      bg: '#140905',
      card: '#24120a',
      border: '#542817',
      accent: '#f97316',
      text: '#ffedd5'
    },
    {
      id: 'emerald',
      name: 'Emerald Forest',
      desc: 'Alpine pine forest night & luminous jade green',
      bg: '#03140e',
      card: '#09281d',
      border: '#1a5c45',
      accent: '#10b981',
      text: '#d1fae5'
    }
  ];

  const handleSavePin = () => {
    if (pinInput.length !== 4) {
      showToast('PIN passcode must be exactly 4 digits');
      return;
    }
    if (pinInput !== pinConfirm) {
      showToast('PIN passcodes do not match');
      return;
    }
    updateSecuritySettings({
      isPasscodeEnabled: true,
      passcode: pinInput
    });
    setPinInput('');
    setPinConfirm('');
    setIsSettingPin(false);
    showToast('Security PIN passcode updated successfully!');
  };

  const navSections: { id: SettingsSection; label: string; icon: any; badge?: string }[] = [
    { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
    { id: 'dual_avatar', label: 'Dual Profile Pictures', icon: Camera },
    { id: 'security', label: 'Security Suite & PIN', icon: Lock },
    { id: 'privacy', label: 'Privacy & Account', icon: Shield },
    { id: 'language', label: 'Language & Translation', icon: Globe },
    { id: 'activity', label: 'Your Activity & Archive', icon: Bookmark },
    { id: 'legal', label: 'Legal Center & Terms', icon: FileText, badge: 'Wrinkled Page' },
    { id: 'account', label: 'Account Management', icon: Users }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-zinc-950 shadow-md shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400">
                Preferences &amp; Governance
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Settings &amp; Activity
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('profile');
                navigate('/app/profile');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Master-Detail Layout */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Navigation Master Sidebar */}
        <aside className="lg:col-span-4 space-y-3">
          {/* User Profile Summary Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-lime-400/50"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>

          {/* Settings Section Pills */}
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            {navSections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  id={`settings-tab-${section.id}`}
                  onClick={() => {
                    if (section.id === 'legal') {
                      setActiveTab('legal');
                      navigate('/app/legal');
                    } else {
                      setActiveSection(section.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-lime-400 text-zinc-950 font-bold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{section.label}</span>
                  </div>
                  {section.badge ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold">
                      {section.badge}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'text-zinc-950' : ''}`} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Detail Content Panel */}
        <section className="lg:col-span-8 space-y-6">
          {/* ========================================================================= */}
          {/* 1. APPEARANCE & THEMES SECTION                                            */}
          {/* ========================================================================= */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-lime-500" />
                      App Atmosphere &amp; Themes
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose from 11 distinctly rendered atmospheric themes. Each preset features unique background, card surface, border, and accent colors.
                    </p>
                  </div>

                  {/* Bright vs Dark Category Switcher */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
                    <button
                      onClick={() => setThemeTab('bright')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        themeTab === 'bright'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Bright (5)
                    </button>
                    <button
                      onClick={() => setThemeTab('dark')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        themeTab === 'dark'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      Dark (6)
                    </button>
                  </div>
                </div>

                {/* Theme Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {(themeTab === 'bright' ? brightThemes : darkThemes).map(themeItem => {
                    const isSelected = systemTheme === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        id={`theme-select-${themeItem.id}`}
                        onClick={() => {
                          setSystemTheme(themeItem.id);
                          showToast(`Activated ${themeItem.name} Theme`);
                        }}
                        className={`group relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between overflow-hidden shadow-xs ${
                          isSelected
                            ? 'border-lime-500 ring-2 ring-lime-500/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                        style={{ backgroundColor: themeItem.bg }}
                      >
                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-lime-500 text-zinc-950 flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 stroke-[3px]" />
                          </div>
                        )}

                        <div className="space-y-2">
                          {/* Mini UI Swatch Preview */}
                          <div
                            className="p-3 rounded-xl border space-y-1.5 shadow-2xs"
                            style={{
                              backgroundColor: themeItem.card,
                              borderColor: themeItem.border
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="w-12 h-2 rounded-full" style={{ backgroundColor: themeItem.text, opacity: 0.8 }} />
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeItem.accent }} />
                            </div>
                            <div className="w-24 h-1.5 rounded-full" style={{ backgroundColor: themeItem.text, opacity: 0.3 }} />
                            <div
                              className="w-full h-5 rounded-lg flex items-center px-2 text-[9px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: themeItem.accent }}
                            >
                              Sample Button
                            </div>
                          </div>

                          <div className="pt-1">
                            <h3
                              className="text-sm font-black tracking-tight"
                              style={{ color: themeItem.text }}
                            >
                              {themeItem.name}
                            </h3>
                            <p
                              className="text-xs font-medium line-clamp-2 mt-0.5"
                              style={{ color: themeItem.text, opacity: 0.7 }}
                            >
                              {themeItem.desc}
                            </p>
                          </div>
                        </div>

                        {/* Color Swatch Dots */}
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: themeItem.text }}>
                            Palette:
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: themeItem.bg }} title="Canvas" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: themeItem.card }} title="Card" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: themeItem.border }} title="Border" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: themeItem.accent }} title="Accent" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. DUAL PROFILE PICTURES SECTION                                          */}
          {/* ========================================================================= */}
          {activeSection === 'dual_avatar' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Camera className="w-5 h-5 text-lime-500" />
                      Dual Custom Profile Pictures
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Configure two independent profile pictures with custom audience visibility permissions.
                    </p>
                  </div>
                  <button
                    id="save-dual-pfp-btn"
                    onClick={handleSaveDualPfp}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5px]" />
                    Save Configuration
                  </button>
                </div>

                {/* Tab Switcher: PFP 1 vs PFP 2 */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setActivePfpTab('pfp1')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activePfpTab === 'pfp1'
                        ? 'bg-lime-400 text-zinc-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <img src={pfp1.url} alt="PFP 1" className="w-5 h-5 rounded-full object-cover" />
                    Profile Picture 1 (Primary)
                  </button>
                  <button
                    onClick={() => setActivePfpTab('pfp2')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activePfpTab === 'pfp2'
                        ? 'bg-lime-400 text-zinc-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <img src={pfp2.url} alt="PFP 2" className="w-5 h-5 rounded-full object-cover" />
                    Profile Picture 2 (Secondary)
                  </button>
                </div>

                {/* Hidden File Input for Device Photo Selection */}
                <input
                  ref={pfpFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePfpFileChange}
                />

                {/* Active PFP Editor */}
                {activePfpTab === 'pfp1' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <img src={pfp1.url} alt="PFP 1 Preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500 shrink-0" />
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Picture 1 (Primary)</label>
                          <button
                            type="button"
                            onClick={() => pfpFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Image from Device</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={pfp1.url}
                          onChange={e => setPfp1({ ...pfp1, url: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          placeholder="Or paste direct image URL..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Audience Visibility</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['everyone', 'followers', 'close_friends', 'custom'] as AvatarAudience[]).map(aud => (
                          <button
                            key={aud}
                            type="button"
                            onClick={() => {
                              setPfp1({ ...pfp1, audience: aud });
                              if (aud === 'custom') setIsPfpDropdownOpen(true);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                              pfp1.audience === aud
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {aud === 'custom' ? 'Custom Users' : aud.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Users Drop Box Menu */}
                    {pfp1.audience === 'custom' && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              Select Users for Primary Profile Picture
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {pfp1.customUserIds?.length || 0} selected
                          </span>
                        </div>

                        {/* Search Input in Dropbox */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            value={customUserSearch}
                            onChange={e => setCustomUserSearch(e.target.value)}
                            placeholder="Search and select users..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Users Selection List */}
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {allUsers
                            .filter(u => u.id !== currentUser.id)
                            .filter(u =>
                              !customUserSearch.trim() ||
                              u.name.toLowerCase().includes(customUserSearch.toLowerCase()) ||
                              u.username.toLowerCase().includes(customUserSearch.toLowerCase())
                            )
                            .map(u => {
                              const isSelected = pfp1.customUserIds?.includes(u.id);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => toggleCustomUser(u.id, u.username)}
                                  className={`w-full p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                                    isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-zinc-400 truncate">@{u.username}</p>
                                    </div>
                                  </div>
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <img src={pfp2.url} alt="PFP 2 Preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500 shrink-0" />
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Picture 2 (Secondary)</label>
                          <button
                            type="button"
                            onClick={() => pfpFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Image from Device</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={pfp2.url}
                          onChange={e => setPfp2({ ...pfp2, url: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          placeholder="Or paste direct image URL..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Audience Visibility</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['everyone', 'followers', 'close_friends', 'custom'] as AvatarAudience[]).map(aud => (
                          <button
                            key={aud}
                            type="button"
                            onClick={() => {
                              setPfp2({ ...pfp2, audience: aud });
                              if (aud === 'custom') setIsPfpDropdownOpen(true);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                              pfp2.audience === aud
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {aud === 'custom' ? 'Custom Users' : aud.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Users Drop Box Menu */}
                    {pfp2.audience === 'custom' && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              Select Users for Secondary Profile Picture
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {pfp2.customUserIds?.length || 0} selected
                          </span>
                        </div>

                        {/* Search Input in Dropbox */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            value={customUserSearch}
                            onChange={e => setCustomUserSearch(e.target.value)}
                            placeholder="Search and select users..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Users Selection List */}
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {allUsers
                            .filter(u => u.id !== currentUser.id)
                            .filter(u =>
                              !customUserSearch.trim() ||
                              u.name.toLowerCase().includes(customUserSearch.toLowerCase()) ||
                              u.username.toLowerCase().includes(customUserSearch.toLowerCase())
                            )
                            .map(u => {
                              const isSelected = pfp2.customUserIds?.includes(u.id);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => toggleCustomUser(u.id, u.username)}
                                  className={`w-full p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                                    isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-zinc-400 truncate">@{u.username}</p>
                                    </div>
                                  </div>
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SECURITY SUITE & PIN SECTION                                           */}
          {/* ========================================================================= */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-lime-500" />
                    Security Suite &amp; PIN Passcode
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account security, 4-digit PIN passcode, biometric login, and hidden vault access code.
                  </p>
                </div>

                {/* PIN Passcode Toggle & Setup */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">4-Digit Security PIN</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {securitySettings?.isPasscodeEnabled ? 'PIN passcode is active' : 'No PIN passcode configured'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsSettingPin(!isSettingPin)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                    >
                      {securitySettings?.isPasscodeEnabled ? 'Change PIN' : 'Set PIN'}
                    </button>
                  </div>

                  {isSettingPin && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">New 4-Digit PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-center font-mono text-base tracking-widest text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Confirm PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={pinConfirm}
                            onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-center font-mono text-base tracking-widest text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsSettingPin(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSavePin}
                          className="px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs shadow-xs"
                        >
                          Save PIN
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secret Code for Hidden Vault */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hidden Vault Secret Code</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Access hidden private chats and secret media vaults with a custom passphrase.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangeSecretCodeModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs"
                  >
                    Change Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PRIVACY & ACCOUNT SECTION                                              */}
          {/* ========================================================================= */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-lime-500" />
                    Privacy &amp; Visibility Controls
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Control who can see your content, followers, and send you direct messages.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
                  {/* Private Account */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Private Account</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Only approved followers can view your posts and stories.</p>
                    </div>
                    <button
                      onClick={toggleAccountPrivacy}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                        isAccountPrivate ? 'bg-lime-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isAccountPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Hide Followers List */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hide Followers List</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Only you can view your full list of followers.</p>
                    </div>
                    <button
                      onClick={toggleFollowersPrivacy}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                        isFollowersPrivate ? 'bg-lime-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isFollowersPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Story Duration */}
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Story Visibility Duration</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Select standard 24 hours or extended 48 hours.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => {
                          setStoryDuration('24h');
                          showToast('Story duration set to 24h');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          storyDuration === '24h' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        24h
                      </button>
                      <button
                        onClick={() => {
                          setStoryDuration('48h');
                          showToast('Story duration set to 48h');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          storyDuration === '48h' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        48h
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. LANGUAGE & TRANSLATION SECTION                                         */}
          {/* ========================================================================= */}
          {activeSection === 'language' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-lime-500" />
                    Language &amp; Localization
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Current active language: <span className="font-bold text-lime-600 dark:text-lime-400">{currentLanguageOption?.name} ({currentLanguageOption?.nativeName})</span>
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={languageSearchQuery}
                    onChange={e => setLanguageSearchQuery(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {INITIAL_LANGUAGES.filter(
                    l =>
                      l.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
                      l.nativeName.toLowerCase().includes(languageSearchQuery.toLowerCase())
                  ).map(lang => {
                    const isSelected = preferredLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setPreferredLanguage(lang.code);
                          showToast(`Language set to ${lang.name}`);
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-lime-400 border-lime-500 text-zinc-950 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{lang.name}</div>
                          <div className="text-[11px] opacity-75">{lang.nativeName}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. YOUR ACTIVITY & ARCHIVE SECTION                                        */}
          {/* ========================================================================= */}
          {activeSection === 'activity' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-lime-500" />
                    Your Activity &amp; Saved Items
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Review your saved bookmarks, liked posts, and archived memories.
                  </p>
                </div>

                {/* Sub tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setActivitySubTab('saved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      activitySubTab === 'saved' ? 'bg-lime-400 text-zinc-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Saved ({savedPosts.length})
                  </button>
                  <button
                    onClick={() => setActivitySubTab('liked')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      activitySubTab === 'liked' ? 'bg-lime-400 text-zinc-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Liked ({likedPosts.length})
                  </button>
                  <button
                    onClick={() => setActivitySubTab('archive')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      activitySubTab === 'archive' ? 'bg-lime-400 text-zinc-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Archived ({archivedPosts.length})
                  </button>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {(activitySubTab === 'saved' ? savedPosts : activitySubTab === 'liked' ? likedPosts : archivedPosts).map(
                    post => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPostForModal(post)}
                        className="aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative group cursor-pointer"
                      >
                        <img src={post.mediaUrls?.[0] || post.mediaUrl || post.image} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. ACCOUNT MANAGEMENT SECTION                                             */}
          {/* ========================================================================= */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-lime-500" />
                    Account Governance
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage multi-account login, data export, or sign out.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsCreateAccountModalOpen(true)}
                    className="w-full p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-4 h-4" />
                      <span>Add or Switch Another Account</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={exportUserData}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4" />
                      <span>Export Your Data &amp; Archives (JSON)</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="w-full p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold text-xs cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Deactivate Account</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={signOutAccount}
                    className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold text-xs cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of Yaawp</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Instagram-style Deactivate Account Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-amber-500" />
                Temporarily Deactivate Account
              </h3>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Deactivating your account is temporary. Your profile, photos, comments, and likes will be hidden until you reactivate it by logging back in.
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Why are you deactivating your account?
                </label>
                <select
                  value={deactivateReason}
                  onChange={e => setDeactivateReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Just need a break">Just need a break</option>
                  <option value="Privacy concerns">Privacy concerns</option>
                  <option value="Created a second account">Created a second account</option>
                  <option value="Too busy / too distracting">Too busy / too distracting</option>
                  <option value="Trouble getting started">Trouble getting started</option>
                  <option value="Something else">Something else</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  To continue, please re-enter your username or password
                </label>
                <input
                  type="password"
                  value={deactivatePassword}
                  onChange={e => setDeactivatePassword(e.target.value)}
                  placeholder="Enter password or confirmation..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!deactivatePassword.trim()) {
                    showToast('Please confirm by entering your password or username');
                    return;
                  }
                  deactivateAccount(deactivateReason);
                  setShowDeactivateModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                Temporarily Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Code Modal if needed */}
      <ChangeSecretCodeModal
        isOpen={showChangeSecretCodeModal}
        onClose={() => setShowChangeSecretCodeModal(false)}
      />
    </div>
  );
};

export default SettingsView;
