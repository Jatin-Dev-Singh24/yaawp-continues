// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/yaawp/compat/router';
import {
  Grid,
  UserCheck,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  ChevronLeft,
  UserPlus,
  Send,
  Shield,
  Film,
  Repeat,
  Menu,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  EyeOff,
  Eye,
  Camera,
  Users,
  Search,
  X,
  Lock,
  Sparkles,
  UserX,
  MoreHorizontal,
  Flag,
  BarChart3,
  Ban,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
import { AnalyticsView } from './AnalyticsView';
import { ProfileSkeleton } from './SkeletonScreens';
import { getLanguageByCode } from '../translations';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    viewedUserId,
    getUserProfile,
    openUserProfile,
    posts,
    reels,
    setSelectedPostForModal,
    setIsEditProfileOpen,
    setIsCreateModalOpen,
    toggleFollowUser,
    startConversationWithUser,
    followedUserIds,
    blockedUsers,
    blockUser,
    unblockUser,
    setActiveTab: setNavActiveTab,
    showToast,
    openLegalModal,
    setIsCreateAccountModalOpen,
    hasAgreedToTerms,
    termsAgreedTimestamp,
    setIsProfileMenuOpen,
    allUsers,
    deletePost,
    editPost,
    archivePost,
    toggleHidePostFromGrid,
    archiveHighlight,
    deleteHighlight,
    isFollowersPrivate,
    hiddenProfileFromUserIds,
    toggleHideMyProfileFrom,
    preferredLanguage,
    currentLanguageOption,
    t
  } = useApp();

  const navigate = useNavigate();

  // Tabs: Posts, Reels, Analytics, Reposts, Tagged
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'analytics' | 'reposts' | 'tagged'>('posts');
  const [otherProfileMenuOpen, setOtherProfileMenuOpen] = useState(false);
  const [previewAsRestrictedUser, setPreviewAsRestrictedUser] = useState(false);
  const [activeViewingHighlight, setActiveViewingHighlight] = useState<{
    id: string;
    title: string;
    coverUrl: string;
  } | null>(null);

  // Modal for Followers / Following list with privacy and hide toggles
  const [followListModal, setFollowListModal] = useState<'followers' | 'following' | null>(null);
  const [followListSearch, setFollowListSearch] = useState('');
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);

  // Post Actions Menu
  const [postActionMenuId, setPostActionMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedCaption, setEditedCaption] = useState('');

  // Highlights state
  const [highlightMenuId, setHighlightMenuId] = useState<string | null>(null);

  // Determine active profile
  const isOwnProfile = !viewedUserId || viewedUserId === currentUser.id;
  const activeProfile = isOwnProfile ? currentUser : getUserProfile(viewedUserId);
  const isFollowing = followedUserIds.includes(activeProfile.id);
  const isBlocked = !isOwnProfile && blockedUsers.includes(activeProfile.id);

  // Skeleton loading on profile navigation
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  useEffect(() => {
    setIsProfileLoading(true);
    const timer = setTimeout(() => {
      setIsProfileLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [viewedUserId]);

  // Filter posts
  const userPosts = posts.filter(p => p.user.id === activeProfile.id);
  const userReels = reels.filter(r => r.user.id === activeProfile.id);
  // Reposted posts: ONLY posts where activeProfile explicitly clicked Repost (or repost entries created by them)
  const repostPosts = posts.filter(
    p =>
      p.repostedBy?.id === activeProfile.id ||
      (p.id.startsWith('repost_') && p.user.id === activeProfile.id)
  );
  // Tagged posts: ONLY posts by OTHER creators where activeProfile is genuinely tagged
  const taggedPosts = posts.filter(
    p =>
      p.user.id !== activeProfile.id &&
      (p.taggedUserIds?.includes(activeProfile.id) ||
        (Boolean(activeProfile.username && activeProfile.username.length > 1) &&
          p.caption &&
          p.caption.toLowerCase().includes(`@${activeProfile.username.toLowerCase()}`)))
  );

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast(`Profile link for @${activeProfile.username} copied to clipboard!`);
  };

  const handleSaveEditCaption = (postId: string) => {
    if (!editedCaption.trim()) return;
    editPost(postId, editedCaption);
    setEditingPostId(null);
    setEditedCaption('');
  };

  const handleToggleHideUser = (userId: string) => {
    setHiddenUserIds(prev => {
      const exists = prev.includes(userId);
      const next = exists ? prev.filter(id => id !== userId) : [...prev, userId];
      showToast(exists ? 'User visible in your lists' : 'User hidden from your lists');
      return next;
    });
  };

  if (isProfileLoading) {
    return (
      <div id="profile-view-loading" className="w-full max-w-4xl mx-auto py-6 px-3 md:px-8">
        <ProfileSkeleton />
      </div>
    );
  }

  // If viewing a user who has hidden their profile from the current logged in user
  const isProfileHiddenFromCurrentViewer =
    !isOwnProfile &&
    hiddenProfileFromUserIds.includes(currentUser.id);

  if (isProfileHiddenFromCurrentViewer) {
    return (
      <div id="profile-view" className="w-full max-w-4xl mx-auto py-10 px-4 text-center animate-in fade-in">
        <div className="flex justify-start mb-6">
          <button
            onClick={() => setNavActiveTab('feed')}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Feed
          </button>
        </div>

        <div className="max-w-md mx-auto py-16 px-6 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl space-y-4 ambient-glow">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <UserX className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white">Profile Unavailable</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            @{activeProfile.username} has hidden their profile from your account. You cannot view their photos, reels, highlights, or stories.
          </p>
          <div className="pt-3">
            <button
              onClick={() => setNavActiveTab('feed')}
              className="px-5 py-2.5 rounded-xl bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 transition-colors"
            >
              Explore Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-view" className="w-full max-w-4xl mx-auto py-6 px-3 md:px-8">
      {/* Back button if viewing another user's profile */}
      {!isOwnProfile && (
        <div className="mb-4">
          <button
            id="back-to-feed-btn"
            onClick={() => setNavActiveTab('feed')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-lime-400 transition-colors py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Feed
          </button>
        </div>
      )}

      {/* Profile Header Container */}
      <div
        id="profile-header-card"
        className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-14 mb-8 relative ambient-glow transition-all"
      >
        {/* Top Right 3-Bar Settings Button */}
        {isOwnProfile && (
          <div className="absolute top-0 right-0 z-20">
            <button
              id="profile-3bar-settings-btn"
              onClick={() => {
                setNavActiveTab('settings');
                navigate('/app/settings');
              }}
              className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-all shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95"
              title="Settings and activity"
            >
              <Menu className="w-5 h-5 text-lime-500 dark:text-lime-400" />
            </button>
          </div>
        )}

        {/* Dual Avatar Container */}
        <div
          className={`relative group shrink-0 ${isOwnProfile ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (isOwnProfile) {
              setNavActiveTab('settings');
              navigate('/app/settings');
            }
          }}
          title={isOwnProfile ? 'Click to manage Dual Profile Pictures in Settings' : undefined}
        >
          <div className="p-1 rounded-full ig-gradient shadow-md">
            <img
              src={activeProfile.avatar}
              alt={activeProfile.username}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-3 border-white dark:border-zinc-900"
            />
          </div>

          {/* Secondary Avatar Badge (For Close Friends / Dual Avatars) */}
          {isOwnProfile && (
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-zinc-900 overflow-hidden ring-2 ring-lime-400 bg-zinc-800 flex items-center justify-center shadow-lg"
              title="Secondary Profile Picture active for Close Friends"
            >
              <Camera className="w-3.5 h-3.5 text-lime-400" />
            </div>
          )}

          {isOwnProfile && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-lime-300 font-bold">Dual Avatars</span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left space-y-3.5 w-full pr-12 md:pr-14">
          {/* Top Row: Username & Interactive Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {activeProfile.username}
              </h2>
              {activeProfile.isVerified && (
                <CheckCircle2 className="w-4 h-4 fill-lime-500 text-black" />
              )}
            </div>

            {isOwnProfile ? (
              <>
                <button
                  id="profile-edit-btn"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-900 dark:text-white transition-colors"
                >
                  Edit profile
                </button>

                <button
                  id="profile-insights-btn"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'analytics'
                      ? 'bg-lime-400 text-zinc-950 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'
                  }`}
                  title="View Profile Analytics & Insights"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                  Insights
                </button>

                <button
                  id="profile-switch-account-btn"
                  onClick={() => setIsCreateAccountModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-900 dark:text-white transition-colors flex items-center gap-1.5"
                  title="Switch or Create Account"
                >
                  <UserPlus className="w-3.5 h-3.5 text-lime-400" />
                  Account
                </button>

                <button
                  id="profile-yaawp-legal-btn"
                  onClick={() => openLegalModal('terms')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                  title="Yaawp Terms & Privacy Policy"
                >
                  <Shield className="w-3.5 h-3.5 text-lime-400" />
                  Legal
                </button>

                <button
                  onClick={handleShareProfile}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-900 dark:text-white transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </>
            ) : (
              <>
                {isBlocked ? (
                  <button
                    id={`profile-unblock-btn-${activeProfile.id}`}
                    onClick={() => unblockUser(activeProfile.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Unblock
                  </button>
                ) : (
                  <>
                    <button
                      id={`profile-toggle-follow-${activeProfile.id}`}
                      onClick={() => toggleFollowUser(activeProfile.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isFollowing
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
                          : 'bg-lime-400 text-zinc-950 font-bold hover:bg-lime-300'
                      }`}
                    >
                      {isFollowing ? (
                        'Following'
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Follow
                        </>
                      )}
                    </button>

                    <button
                      id={`profile-message-btn-${activeProfile.id}`}
                      onClick={() => startConversationWithUser(activeProfile)}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-900 dark:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Message
                    </button>

                    <button
                      id={`profile-block-btn-${activeProfile.id}`}
                      onClick={() => blockUser(activeProfile.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors flex items-center gap-1.5"
                      title="Block this user"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-500" />
                      Block
                    </button>
                  </>
                )}

                <button
                  onClick={handleShareProfile}
                  className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white transition-colors"
                  title="Share profile"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* Profile 3-Dot Options Menu */}
                <div className="relative">
                  <button
                    id="other-profile-menu-btn"
                    onClick={() => setOtherProfileMenuOpen(!otherProfileMenuOpen)}
                    className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white transition-colors"
                    title="Profile options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {otherProfileMenuOpen && (
                    <div className="absolute left-0 sm:right-0 sm:left-auto top-9 z-30 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-1.5 space-y-1 text-xs text-zinc-200 animate-in fade-in">
                      <button
                        id={`menu-block-toggle-btn-${activeProfile.id}`}
                        onClick={() => {
                          if (isBlocked) {
                            unblockUser(activeProfile.id);
                          } else {
                            blockUser(activeProfile.id);
                          }
                          setOtherProfileMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left rounded-xl flex items-center gap-2.5 font-medium transition-colors ${
                          isBlocked
                            ? 'text-lime-400 hover:bg-lime-400/10'
                            : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        <Ban className="w-4 h-4 shrink-0" />
                        <span>
                          {isBlocked
                            ? `Unblock @${activeProfile.username}`
                            : `Block @${activeProfile.username}`}
                        </span>
                      </button>

                      <button
                        id="menu-hide-my-profile-btn"
                        onClick={() => {
                          toggleHideMyProfileFrom(activeProfile.id);
                          setOtherProfileMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left rounded-xl flex items-center gap-2.5 font-medium transition-colors ${
                          hiddenProfileFromUserIds.includes(activeProfile.id)
                            ? 'text-lime-400 hover:bg-lime-400/10'
                            : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        <UserX className="w-4 h-4 shrink-0" />
                        <span>
                          {hiddenProfileFromUserIds.includes(activeProfile.id)
                            ? 'Unhide my profile from this user'
                            : `Hide my profile from @${activeProfile.username}`}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          handleShareProfile();
                          setOtherProfileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-zinc-800 flex items-center gap-2.5 text-zinc-300"
                      >
                        <Share2 className="w-4 h-4 shrink-0 text-zinc-400" />
                        <span>Copy profile link</span>
                      </button>

                      <button
                        onClick={() => {
                          showToast(`Report submitted for @${activeProfile.username}`);
                          setOtherProfileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-zinc-800 flex items-center gap-2.5 text-zinc-400"
                      >
                        <Flag className="w-4 h-4 shrink-0 text-zinc-400" />
                        <span>Report account</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Stats Row: Clickable for Follower/Following Privacy Modal */}
          <div className="flex items-center justify-center md:justify-start gap-7 text-xs md:text-sm">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {userPosts.length}
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">posts</span>
            </div>

            <button
              onClick={() => setFollowListModal('followers')}
              className="hover:opacity-80 transition-opacity"
            >
              <span className="font-bold text-slate-900 dark:text-white">
                {activeProfile.followersCount.toLocaleString()}
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">followers</span>
              {isFollowersPrivate && (
                <span title="Private followers list" className="inline-flex items-center">
                  <Lock className="w-3 h-3 inline-block ml-1 text-lime-400" />
                </span>
              )}
            </button>

            <button
              onClick={() => setFollowListModal('following')}
              className="hover:opacity-80 transition-opacity"
            >
              <span className="font-bold text-slate-900 dark:text-white">
                {activeProfile.followingCount.toLocaleString()}
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">following</span>
            </button>
          </div>

          {/* Bio & Details */}
          <div className="space-y-1 text-xs md:text-sm">
            <h1 className="font-bold text-slate-900 dark:text-white">
              {activeProfile.name}
            </h1>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {activeProfile.bio}
            </p>
            {activeProfile.website && (
              <a
                href={activeProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lime-600 dark:text-lime-400 hover:underline flex items-center justify-center md:justify-start gap-1"
              >
                <span>{activeProfile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Interests tags */}
          {activeProfile.interests && activeProfile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start pt-1">
              {activeProfile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-lime-400/10 text-lime-500 border border-lime-400/20"
                >
                  #{interest}
                </span>
              ))}
            </div>
          )}

          {/* Preferred Language Display */}
          {(() => {
            const langCode = isOwnProfile ? preferredLanguage : (activeProfile.preferred_language || 'en');
            const langOpt = getLanguageByCode(langCode);
            return (
              <div className="pt-1 flex items-center justify-center md:justify-start">
                <button
                  id="profile-preferred-language-badge"
                  type="button"
                  onClick={() => {
                    if (isOwnProfile) {
                      setIsProfileMenuOpen(true);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    isOwnProfile
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer shadow-2xs'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                  }`}
                  title={isOwnProfile ? "Change preferred language in Settings" : `Preferred Language: ${langOpt.name}`}
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {langOpt.nativeName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    ({langOpt.name})
                  </span>
                  {isOwnProfile && (
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 ml-1 underline underline-offset-2">
                      Change
                    </span>
                  )}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Hidden Profile Banner (when currentUser hid profile from this user) */}
      {!isOwnProfile && hiddenProfileFromUserIds.includes(activeProfile.id) && (
        <div className="mb-6 p-3.5 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in ambient-glow">
          <div className="flex items-center gap-2.5 text-rose-300">
            <UserX className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Your profile is hidden from @{activeProfile.username}.</strong> They cannot see your profile, posts, reels, or stories (while you can still view theirs).
            </span>
          </div>
          <button
            onClick={() => toggleHideMyProfileFrom(activeProfile.id)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold shrink-0 transition-colors"
          >
            Unhide My Profile
          </button>
        </div>
      )}

      {/* Own Profile: Hidden Profiles Alert Banner */}
      {isOwnProfile && hiddenProfileFromUserIds.length > 0 && (
        <div className="mb-6 p-3 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ambient-glow">
          <div className="flex items-center gap-2 text-zinc-300">
            <UserX className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Your profile is hidden from <strong>{hiddenProfileFromUserIds.length} {hiddenProfileFromUserIds.length === 1 ? 'person' : 'people'}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPreviewAsRestrictedUser(!previewAsRestrictedUser)}
              className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              {previewAsRestrictedUser ? 'Exit Preview' : 'Preview Restricted View'}
            </button>
            <button
              onClick={() => {
                setNavActiveTab('settings');
                navigate('/app/settings');
              }}
              className="px-3 py-1 rounded-xl bg-lime-400 text-zinc-950 text-xs font-bold hover:bg-lime-300 transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      )}

      {/* If previewing as restricted user: show unavailable state */}
      {previewAsRestrictedUser ? (
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto bg-zinc-950/70 border border-zinc-800 rounded-3xl p-8 my-6 animate-in fade-in ambient-glow">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Profile Unavailable</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This account has hidden their profile from you or restricted access. You cannot view their photos, reels, or stories.
            </p>
          </div>
          <button
            onClick={() => setPreviewAsRestrictedUser(false)}
            className="px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 text-xs font-bold hover:bg-lime-300 transition-colors"
          >
            Exit Restricted Preview
          </button>
        </div>
      ) : isBlocked ? (
        <div
          id="profile-blocked-message-card"
          className="py-16 px-6 text-center space-y-4 max-w-md mx-auto bg-zinc-950/70 border border-zinc-800 rounded-3xl my-8 animate-in fade-in ambient-glow"
        >
          <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Ban className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">
              You've blocked @{activeProfile.username}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              You won't see their posts, reels, or stories in your feed, and they can't message you or find your profile.
            </p>
          </div>
          <div className="pt-2">
            <button
              id="profile-blocked-unblock-center-btn"
              onClick={() => unblockUser(activeProfile.id)}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors inline-flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Unblock @{activeProfile.username}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Highlights Carousel with Edit & Archive */}
          {activeProfile.highlights && activeProfile.highlights.length > 0 && (
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 mb-6 flex items-center gap-4 overflow-x-auto scrollbar-none ambient-glow">
          {activeProfile.highlights.map(hl => (
            <div
              key={hl.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group relative"
            >
              <div
                onClick={() => setActiveViewingHighlight(hl)}
                className="w-[66px] h-[66px] rounded-full p-[2px] bg-zinc-300 dark:bg-zinc-700 group-hover:bg-lime-400 transition-colors"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-zinc-900">
                  <img
                    src={hl.coverUrl}
                    alt={hl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[66px]">
                  {hl.title}
                </span>
                {isOwnProfile && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setHighlightMenuId(highlightMenuId === hl.id ? null : hl.id);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Highlight Action Popup */}
              {highlightMenuId === hl.id && (
                <div className="absolute top-16 left-0 z-30 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 text-xs">
                  <button
                    onClick={() => {
                      archiveHighlight?.(hl.id);
                      setHighlightMenuId(null);
                      showToast(`Archived highlight "${hl.title}"`);
                    }}
                    className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      deleteHighlight(hl.id);
                      setHighlightMenuId(null);
                    }}
                    className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          {isOwnProfile && (
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-[62px] h-[62px] rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-zinc-800 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">New</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs Row: Posts, Reels, Analytics, Reposts, Tagged */}
      <div className="flex items-center justify-center border-t border-slate-200 dark:border-zinc-800 mb-4 overflow-x-auto scrollbar-none">
        {[
          { id: 'posts', label: 'POSTS', icon: Grid },
          { id: 'reels', label: 'REELS', icon: Film },
          { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
          { id: 'reposts', label: 'REPOSTS', icon: Repeat },
          { id: 'tagged', label: 'TAGGED', icon: UserCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 md:px-6 text-xs font-bold tracking-wider transition-colors border-t-2 shrink-0 ${
                isActive
                  ? 'border-lime-400 text-lime-500 dark:text-lime-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts Tab Content */}
      {activeTab === 'posts' && (
        userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {userPosts.map(post => (
              <div
                key={post.id}
                id={`profile-post-${post.id}`}
                className="group relative aspect-square bg-slate-900 overflow-hidden rounded-xl cursor-pointer ambient-glow border border-transparent hover:border-indigo-500/40 transition-all"
              >
                <img
                  src={post.mediaUrls[0]}
                  alt={post.caption}
                  onClick={() => setSelectedPostForModal(post)}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${post.filterClass || 'filter-normal'}`}
                  loading="lazy"
                />

                {/* Top Action 3-dots Button for Edit/Archive/Hide/Delete */}
                {isOwnProfile && (
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setPostActionMenuId(postActionMenuId === post.id ? null : post.id);
                      }}
                      className="p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Post Action Menu Dropdown */}
                {postActionMenuId === post.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="absolute top-10 right-2 z-30 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-1.5 space-y-1 text-xs text-zinc-200 animate-in fade-in"
                  >
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditedCaption(post.caption);
                        setPostActionMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-zinc-800 flex items-center gap-2 text-zinc-200"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-lime-400" />
                      Edit Caption
                    </button>

                    <button
                      onClick={() => {
                        archivePost(post.id);
                        setPostActionMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-zinc-800 flex items-center gap-2 text-zinc-200"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      Archive Post
                    </button>

                    <button
                      onClick={() => {
                        toggleHidePostFromGrid(post.id);
                        setPostActionMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-zinc-800 flex items-center gap-2 text-zinc-200"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                      Hide from Grid
                    </button>

                    <button
                      onClick={() => {
                        deletePost(post.id);
                        setPostActionMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-rose-950/50 flex items-center gap-2 text-rose-400 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Post
                    </button>
                  </div>
                )}

                {/* Hover Stats */}
                <div
                  onClick={() => setSelectedPostForModal(post)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-semibold text-xs md:text-sm"
                >
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white text-white" />
                    <span>{post.likesCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-zinc-700 mx-auto flex items-center justify-center text-slate-400">
              <Grid className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isOwnProfile ? 'Share Photos' : 'No Posts Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isOwnProfile
                ? 'When you share photos, they will appear on your profile.'
                : `@${activeProfile.username} hasn't posted any photos yet.`}
            </p>
          </div>
        )
      )}

      {/* Reels Tab Content */}
      {activeTab === 'reels' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
          {(userReels.length > 0 ? userReels : reels.slice(0, 3)).map(reel => (
            <div
              key={reel.id}
              onClick={() => {
                setNavActiveTab('reels');
              }}
              className="relative aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer group ambient-glow border border-transparent hover:border-indigo-500/40 transition-all"
            >
              <img src={reel.thumbnailUrl} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                <p className="text-xs font-bold line-clamp-1">{reel.caption}</p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    {reel.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {reel.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <AnalyticsView
          profile={activeProfile}
          userPosts={userPosts}
          userReels={userReels}
          isOwnProfile={isOwnProfile}
        />
      )}

      {/* Reposts Tab Content */}
      {activeTab === 'reposts' && (
        repostPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {repostPosts.map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedPostForModal(post)}
                className="group relative aspect-square bg-slate-900 overflow-hidden cursor-pointer rounded-xl ambient-glow border border-transparent hover:border-indigo-500/40 transition-all"
              >
                <img src={post.mediaUrls[0]} alt={post.caption} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 p-1 rounded-full bg-black/60 text-indigo-400">
                  <Repeat className="w-3.5 h-3.5" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold text-xs">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likesCount}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Repeat className="w-12 h-12 mx-auto text-zinc-500" />
            <h3 className="text-sm font-bold text-white">No Reposts Yet</h3>
            <p className="text-xs text-zinc-500">Posts you share or amplify will appear here.</p>
          </div>
        )
      )}

      {/* Tagged Tab Content */}
      {activeTab === 'tagged' && (
        taggedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {taggedPosts.map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedPostForModal(post)}
                className="group relative aspect-square bg-slate-900 overflow-hidden cursor-pointer rounded-xl ambient-glow border border-transparent hover:border-indigo-500/40 transition-all"
              >
                <img src={post.mediaUrls[0]} alt={post.caption} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 p-1 rounded-full bg-black/60 text-white">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <UserCheck className="w-12 h-12 mx-auto text-zinc-500" />
            <h3 className="text-sm font-bold text-white">No Tagged Posts Yet</h3>
            <p className="text-xs text-zinc-500">Posts and photos where you are tagged will appear here.</p>
          </div>
        )
      )}

      {/* Edit Post Modal */}
      {editingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl ambient-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-lime-400" />
                Edit Post Caption
              </h3>
              <button
                onClick={() => setEditingPostId(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={editedCaption}
              onChange={e => setEditedCaption(e.target.value)}
              rows={4}
              className="w-full p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-lime-400"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingPostId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEditCaption(editingPostId)}
                className="px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Followers / Following List Modal with Privacy & Conceal Buttons */}
      {followListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] ambient-glow">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-lime-400" />
                <h3 className="text-sm font-bold text-white capitalize">
                  {followListModal} List
                </h3>
              </div>
              <button
                onClick={() => setFollowListModal(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search in List */}
            <div className="p-3 border-b border-zinc-800/60 bg-zinc-950/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={followListSearch}
                  onChange={e => setFollowListSearch(e.target.value)}
                  placeholder={`Search ${followListModal}...`}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-800/50">
              {allUsers
                .filter(u => u.id !== currentUser.id)
                .filter(u => u.username.toLowerCase().includes(followListSearch.toLowerCase()) || u.name.toLowerCase().includes(followListSearch.toLowerCase()))
                .map(user => {
                  const isHidden = hiddenUserIds.includes(user.id);
                  const isFollowed = followedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className="p-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors rounded-xl"
                    >
                      <div
                        onClick={() => {
                          setFollowListModal(null);
                          openUserProfile(user.id);
                        }}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-white hover:underline">{user.name}</p>
                          <p className="text-[10px] text-zinc-400">@{user.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwnProfile && (
                          <button
                            onClick={() => handleToggleHideUser(user.id)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                              isHidden
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                            title={isHidden ? 'Hidden from public lists' : 'Visible in lists'}
                          >
                            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        <button
                          onClick={() => toggleFollowUser(user.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                            isFollowed
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                          }`}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Yaawp Accounts Center & Legal Compliance */}
      {isOwnProfile && (
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-zinc-800">
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Yaawp Accounts Center &amp; Privacy
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                      {hasAgreedToTerms ? 'Terms Accepted' : 'Consent Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                    Your account is governed by Yaawp Terms of Use, Privacy Policy, Cookie Policy, and Community Guidelines.
                    {termsAgreedTimestamp && (
                      <span className="block mt-0.5 text-[11px] text-slate-400">
                        Agreement active since {new Date(termsAgreedTimestamp).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  id="profile-view-terms-btn"
                  onClick={() => openLegalModal('terms')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Terms of Use
                </button>
                <button
                  id="profile-view-privacy-btn"
                  onClick={() => openLegalModal('privacy')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  id="profile-view-cookies-btn"
                  onClick={() => openLegalModal('cookies')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Active Highlight Viewer Modal */}
      {activeViewingHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
            {/* Top Bar with title and close */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold leading-tight">@{activeProfile.username}</p>
                  <p className="text-[10px] text-white/70">{activeViewingHighlight.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewingHighlight(null)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
                title="Close highlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Background Image / Story Media */}
            <img
              src={activeViewingHighlight.coverUrl}
              alt={activeViewingHighlight.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Bottom highlight info */}
            <div className="relative z-10 p-3 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/10 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block">{activeViewingHighlight.title}</span>
                <span className="text-[10px] text-white/70">Story Highlight</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewingHighlight(null)}
                className="px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-white/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
