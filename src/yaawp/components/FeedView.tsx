// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Flame,
  Sparkles,
  Users,
  Compass,
  SlidersHorizontal,
  UserPlus,
  ArrowDown,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  MapPin,
  Lock,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoriesBar } from './StoriesBar';
import { PostCard } from './PostCard';
import { SuggestionsSidebar } from './SuggestionsSidebar';
import { CommunityJoinButton } from './CommunityJoinButton';
import { AlgorithmSettingsModal } from './AlgorithmSettingsModal';
import { CustomCirclesModal } from './CustomCirclesModal';
import { NearbyActivitiesModal } from './NearbyActivitiesModal';
import { FeedPostSkeleton, HomePageFeedSkeleton } from './SkeletonScreens';
import { PullToRefresh } from './PullToRefresh';
import { useApp } from '../context/AppContext';

interface FeedViewProps {
  isLoading?: boolean;
}

export const FeedView: React.FC<FeedViewProps> = ({ isLoading = false }) => {
  const {
    feedPosts,
    posts,
    feedMode,
    setFeedMode,
    feedSort,
    setFeedSort,
    followedUserIds,
    allUsers,
    currentUser,
    toggleFollowUser,
    refreshFeed,
    isFeedRefreshing,
    isOffline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    feedCacheTimestamp,
    communities,
    setActiveTab,
    customCircles,
    activeCustomCircleId,
    setActiveCustomCircleId,
    setIsCreateModalOpen
  } = useApp();

  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false);
  const [showCirclesModal, setShowCirclesModal] = useState(false);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const [isTuneFeedCollapsed, setIsTuneFeedCollapsed] = useState(false);
  const [isTestingSkeleton, setIsTestingSkeleton] = useState(false);

  // Smooth content skeleton transition when switching algorithm filters
  useEffect(() => {
    setIsFilterTransitioning(true);
    const timer = setTimeout(() => setIsFilterTransitioning(false), 280);
    return () => clearTimeout(timer);
  }, [feedMode, feedSort, activeCustomCircleId]);

  const followedCreatorsCount = followedUserIds.length;

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [hasRefreshedSuccess, setHasRefreshedSuccess] = useState(false);

  const startYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const PULL_THRESHOLD = 65;
  const MAX_PULL_DISTANCE = 110;

  // Touch handlers for mobile swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 5 && !isFeedRefreshing) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isFeedRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && window.scrollY <= 5) {
      setIsPulling(true);
      // Damped rubber-band pull distance
      const distance = Math.min(MAX_PULL_DISTANCE, Math.pow(diff, 0.82) * 1.8);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const triggerRefresh = useCallback(async () => {
    setIsPulling(false);
    setPullDistance(PULL_THRESHOLD);
    try {
      await refreshFeed();
      setHasRefreshedSuccess(true);
      setTimeout(() => setHasRefreshedSuccess(false), 2000);
    } finally {
      setPullDistance(0);
    }
  }, [refreshFeed]);

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD && !isFeedRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Mouse drag handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.scrollY <= 5 && !isFeedRefreshing && e.button === 0) {
      startYRef.current = e.clientY;
      isDraggingRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isFeedRefreshing) return;
    const currentY = e.clientY;
    const diff = currentY - startYRef.current;

    if (diff > 5 && window.scrollY <= 5) {
      setIsPulling(true);
      const distance = Math.min(MAX_PULL_DISTANCE, Math.pow(diff, 0.82) * 1.8);
      setPullDistance(distance);
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD && !isFeedRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Format cache time
  const formattedCacheTime = feedCacheTimestamp
    ? new Date(feedCacheTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Recently';

  const rotationDeg = Math.min(180, (pullDistance / PULL_THRESHOLD) * 180);
  const isPastThreshold = pullDistance >= PULL_THRESHOLD;

  if (isLoading || isTestingSkeleton) {
    return <HomePageFeedSkeleton />;
  }

  return (
    <div
      id="feed-view-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex justify-center max-w-[960px] mx-auto py-6 px-2 md:px-6 gap-8 select-none"
    >
      {/* Center Feed Column */}
      <main className="w-full max-w-[480px] flex flex-col items-center shrink-0 relative">
        {/* Pull-to-Refresh Indicator Container */}
        <div
          id="pull-to-refresh-container"
          style={{
            height: isFeedRefreshing ? `${PULL_THRESHOLD}px` : `${pullDistance}px`,
            opacity: pullDistance > 8 || isFeedRefreshing ? 1 : 0
          }}
          className="w-full flex flex-col items-center justify-center overflow-hidden transition-[height,opacity] duration-150 ease-out pointer-events-none"
        >
          <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200">
            {isFeedRefreshing ? (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400" />
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">Fetching fresh posts...</span>
              </div>
            ) : isPastThreshold ? (
              <>
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <span>Release to refresh</span>
              </>
            ) : (
              <>
                <div style={{ transform: `rotate(${rotationDeg}deg)` }}>
                  <ArrowDown className="w-4 h-4 text-slate-400" />
                </div>
                <span>Pull down to refresh</span>
              </>
            )}
          </div>
        </div>

        {/* Offline Caching Layer Status Banner */}
        <div className="w-full mb-4 space-y-2">
          {/* Active Offline Notice */}
          {isOffline && (
            <motion.div
              id="offline-caching-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <WifiOff className="w-4 h-4" />
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold">Offline Mode Active</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                      Cached Feed
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
                    Displaying {feedPosts.length} posts persisted in localStorage. Cached at {formattedCacheTime}.
                  </p>
                </div>
              </div>

              <button
                onClick={toggleSimulatedOffline}
                className="text-[10px] font-semibold px-2 py-1 rounded-md bg-amber-200/60 dark:bg-amber-900 hover:bg-amber-300/80 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 shrink-0 transition-colors cursor-pointer"
                title="Toggle offline simulation"
              >
                Go Online
              </button>
            </motion.div>
          )}

          {/* Offline Cache Testing & Manual Refresh Bar */}
          <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">
                {isOffline ? 'Offline storage active' : 'Feed cached in localStorage'}
              </span>
              <span className="hidden sm:inline text-slate-400">• {formattedCacheTime}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Manual pull-to-refresh trigger button */}
              <button
                id="manual-refresh-feed-btn"
                onClick={triggerRefresh}
                disabled={isFeedRefreshing}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-70 cursor-pointer"
                title="Pull or click to refresh feed"
              >
                {isFeedRefreshing ? (
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Refresh</span>
                  </>
                )}
              </button>

              {/* Offline mode test toggle button */}
              <button
                id="toggle-offline-simulation-btn"
                onClick={toggleSimulatedOffline}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  isOffline
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
                title="Simulate offline mode to test localStorage caching"
              >
                {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                <span>{isOffline ? 'Sim: Offline' : 'Test Offline'}</span>
              </button>

              {/* Skeleton screen preview button */}
              <button
                id="preview-feed-skeleton-btn"
                onClick={() => {
                  setIsTestingSkeleton(true);
                  setTimeout(() => setIsTestingSkeleton(false), 1400);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Preview full skeleton screen loader"
              >
                <Layers className="w-3 h-3 text-indigo-500" />
                <span>Skeleton</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stories Bar */}
        <StoriesBar />

        {/* Feed Algorithm Controls Bar */}
        <section
          id="feed-algorithm-controls"
          aria-label="Feed Algorithm Controls"
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-xs ambient-glow transition-all"
        >
          {/* Primary Feed Source Filter: Following vs For You vs Communities vs Circles vs Nearby */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
              <button
                id="feed-mode-following-btn"
                onClick={() => setFeedMode('following')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  feedMode === 'following'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Following
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium">
                  {followedCreatorsCount}
                </span>
              </button>

              <button
                id="feed-mode-foryou-btn"
                onClick={() => setFeedMode('for_you')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  feedMode === 'for_you' || feedMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                For You
              </button>

              <button
                id="feed-mode-communities-btn"
                onClick={() => setFeedMode('communities')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  feedMode === 'communities'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Communities
              </button>

              <button
                id="feed-mode-circles-btn"
                onClick={() => setShowCirclesModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  feedMode === 'custom_list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Circles
                {feedMode === 'custom_list' && (
                  <span className="text-[10px] px-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-600">
                    Active
                  </span>
                )}
              </button>

              <button
                id="feed-mode-nearby-btn"
                onClick={() => setShowNearbyModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Nearby Meetups
              </button>
            </div>

            {/* Tune Algorithm Button */}
            <button
              id="open-algorithm-tuning-btn"
              onClick={() => setShowAlgorithmModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
              title="Configure recommendations, mute topics & people"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tune Feed</span>
            </button>
          </div>

          {/* Ranking & Sort Algorithm Selector */}
          <div className="pt-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                id="feed-sort-chronological-btn"
                onClick={() => setFeedSort('chronological')}
                title="Sort chronologically by publication time"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
                  feedSort === 'chronological'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3 h-3" />
                Chronological
              </button>

              <button
                id="feed-sort-balanced-btn"
                onClick={() => setFeedSort('balanced')}
                title="Balanced algorithm: fresh content with high community engagement"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
                  feedSort === 'balanced'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Balanced
              </button>

              <button
                id="feed-sort-engagement-btn"
                onClick={() => setFeedSort('engagement')}
                title="Sort by highest likes, comments and saves"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
                  feedSort === 'engagement'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3 h-3" />
                Engagement
              </button>
            </div>

            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {feedPosts.length} {feedPosts.length === 1 ? 'post' : 'posts'}
              {isOffline && ' (offline)'}
            </span>
          </div>
        </section>

        {/* Posts Stream */}
        <div className="w-full">
          {isFeedRefreshing || isFilterTransitioning ? (
            <FeedPostSkeleton count={3} />
          ) : feedPosts.length > 0 ? (
            feedPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                <PostCard post={post} />

                {/* Creative Communities Showcase Card inserted after 2nd post */}
                {index === 1 && communities.length > 0 && (
                  <div
                    id="feed-community-discovery-card"
                    className="w-full max-w-[480px] bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-4 mb-6 shadow-xs ambient-glow transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                          <Users className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Discover Creative Communities
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Join specialized enclaves to connect with makers
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('communities')}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {communities.slice(0, 2).map(comm => (
                        <div
                          key={comm.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80"
                        >
                          <div
                            onClick={() => setActiveTab('communities')}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                          >
                            <img
                              src={comm.avatar}
                              alt={comm.name}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:underline truncate max-w-[150px]">
                                {comm.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[170px]">
                                {comm.membersCount.toLocaleString()} members • #{comm.topicTags[0]}
                              </span>
                            </div>
                          </div>

                          {/* Community Join Button with micro-interaction */}
                          <CommunityJoinButton
                            communityId={comm.id}
                            isJoined={comm.isJoined}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div
              id="feed-empty-state"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 mb-6 shadow-xs"
            >
              <div className="w-14 h-14 rounded-full bg-lime-50 dark:bg-lime-950/40 flex items-center justify-center mx-auto text-lime-600 dark:text-lime-400">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {posts.length === 0 ? 'No posts yet' : 'No posts matching this view'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {posts.length === 0
                    ? 'Your feed is clean and ready. Share your very first photo or thought with the community!'
                    : 'Follow creators to customize your feed with their latest posts, or switch to All Posts.'}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  id="feed-empty-create-post-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-lime-500 hover:bg-lime-400 text-zinc-950 text-xs font-semibold tracking-wider uppercase transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create First Post</span>
                </button>
                {posts.length > 0 && feedMode !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFeedMode('all')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-2 cursor-pointer"
                  >
                    View All Community Posts →
                  </button>
                )}
              </div>

              {/* Recommended Creators to follow if any other creators exist */}
              {allUsers.filter(u => u.id !== currentUser.id && !followedUserIds.includes(u.id)).length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 max-w-xs mx-auto text-left">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">Suggested Creators</p>
                  {allUsers
                    .filter(u => u.id !== currentUser.id && !followedUserIds.includes(u.id))
                    .slice(0, 3)
                    .map(creator => (
                      <div
                        key={creator.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={creator.avatar}
                            alt={creator.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {creator.username}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {creator.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFollowUser(creator.id)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          Follow
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* End of feed catch-up mark */}
          {feedPosts.length > 0 && (
            <div className="py-10 text-center space-y-2 border-t border-slate-200 dark:border-slate-800 my-6">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-500 p-[2px] mx-auto">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  ✓
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                You're all caught up
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isOffline
                  ? 'All cached offline posts rendered.'
                  : "You've seen all new posts matching your algorithm filter."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Right Suggestions Column (Desktop only) */}
      <SuggestionsSidebar />

      {/* Algorithm Tuning Modal */}
      <AlgorithmSettingsModal
        isOpen={showAlgorithmModal}
        onClose={() => setShowAlgorithmModal(false)}
      />

      {/* Custom Audience Circles Modal */}
      <CustomCirclesModal
        isOpen={showCirclesModal}
        onClose={() => setShowCirclesModal(false)}
      />

      {/* Nearby Activities & Meetups Modal */}
      <NearbyActivitiesModal
        isOpen={showNearbyModal}
        onClose={() => setShowNearbyModal(false)}
      />
    </div>
  );
};
