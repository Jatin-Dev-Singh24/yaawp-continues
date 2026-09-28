import React from 'react';
import {
  Image as ImageIcon,
  Film,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  HelpCircle,
  Smile,
  Compass,
  Sparkles,
  Users,
  Sliders,
  Clock,
  Layers
} from 'lucide-react';

/**
 * Content-specific Skeleton for individual Feed Post Cards.
 * Matches the exact geometry, hierarchy, padding, and layout of PostCard.
 */
export const FeedPostSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div id="feed-post-skeleton-list" className="w-full space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`feed-skeleton-${index}`}
          className="w-full max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden select-none transition-all"
        >
          {/* Header Row */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100/80 dark:border-slate-800/60">
            <div className="flex items-center space-x-3">
              {/* Avatar circle with subtle ring */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ring-1 ring-slate-200/80 dark:ring-slate-700 shrink-0" />
              </div>

              {/* Username and Location/Timestamp */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    style={{ width: `${96 + (index % 3) * 16}px` }}
                    className="h-3.5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <div
                  style={{ width: `${56 + (index % 2) * 14}px` }}
                  className="h-2 rounded bg-slate-150 dark:bg-slate-800/60 animate-pulse"
                />
              </div>
            </div>

            {/* Header Options Buttons (Why button + More dots) */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
            </div>
          </div>

          {/* Media Body Container with shimmer gradient and subtle icon */}
          <div className="w-full aspect-square bg-slate-150 dark:bg-slate-850 animate-shimmer relative flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-700">
              <ImageIcon className="w-10 h-10 stroke-[1.2] opacity-50" />
              <div className="w-20 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
            </div>

            {/* Subtle Carousel / Aspect ratio pill skeleton indicator */}
            {index % 2 === 1 && (
              <div className="absolute bottom-3 right-3 bg-black/25 dark:bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs">
                <div className="w-6 h-2 rounded bg-white/40 dark:bg-white/30 animate-pulse" />
              </div>
            )}
          </div>

          {/* Action Row & Details */}
          <div className="p-4 space-y-3">
            {/* Action buttons (Like, Comment, Share ... Bookmark) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* Likes count bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-3.5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* Caption lines of realistic varying length */}
            <div className="space-y-1.5 pt-0.5">
              <div
                style={{ width: `${82 + (index % 3) * 6}%` }}
                className="h-3 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
              <div
                style={{ width: `${58 + (index % 2) * 12}%` }}
                className="h-2.5 rounded-md bg-slate-150 dark:bg-slate-800/70 animate-pulse"
              />
            </div>

            {/* Comments Count & Timestamp */}
            <div className="pt-1 flex items-center justify-between">
              <div className="w-28 h-2.5 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              <div className="w-14 h-2 rounded-md bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
            </div>

            {/* Quick Comment Input Field Skeleton */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="w-32 h-2.5 rounded bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              </div>
              <div className="w-10 h-3 rounded bg-indigo-100 dark:bg-indigo-950/60 animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

/**
 * Content-specific Skeleton for Stories Bar.
 * Matches horizontal carousel layout with user avatar circles and labels.
 */
export const StoriesBarSkeleton: React.FC = () => {
  return (
    <div
      id="stories-bar-skeleton"
      className="relative w-full max-w-[480px] md:max-w-xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs py-3.5 px-3 select-none"
    >
      <div className="flex items-center space-x-5 overflow-x-auto px-2 no-scrollbar">
        {/* Current User Story Circle Skeleton */}
        <div className="flex flex-col items-center space-y-1.5 shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 p-[2px] animate-pulse ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>
          <div className="w-14 h-2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Other Users' Stories Skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`story-skel-${i}`} className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 p-[2px] animate-pulse ring-2 ring-indigo-200/70 dark:ring-indigo-900/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" />
            <div
              style={{ width: `${40 + (i % 3) * 6}px` }}
              className="h-2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Content-specific Skeleton for Feed Algorithm Controls Bar.
 * Matches the feed mode buttons (Following, For You, Communities, etc.)
 * and sort options (Chronological, Balanced, Engagement).
 */
export const FeedAlgorithmControlsSkeleton: React.FC = () => {
  return (
    <section
      id="feed-algorithm-controls-skeleton"
      aria-label="Loading algorithm controls"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-xs select-none"
    >
      {/* Primary Feed Source Filter Skeleton */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
          <div className="w-20 h-7 rounded-md bg-white dark:bg-slate-700 shadow-xs animate-pulse" />
          <div className="w-18 h-7 rounded-md bg-slate-200/60 dark:bg-slate-700/50 animate-pulse" />
          <div className="w-22 h-7 rounded-md bg-slate-200/60 dark:bg-slate-700/50 animate-pulse" />
          <div className="w-16 h-7 rounded-md bg-slate-200/60 dark:bg-slate-700/50 animate-pulse" />
          <div className="w-24 h-7 rounded-md bg-slate-200/40 dark:bg-slate-700/30 animate-pulse" />
        </div>

        {/* Tune Feed Button Skeleton */}
        <div className="w-24 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>

      {/* Ranking & Sort Algorithm Selector Skeleton */}
      <div className="pt-2.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 animate-pulse" />
          <div className="w-20 h-6 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          <div className="w-22 h-6 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>

        <div className="w-14 h-3 rounded bg-slate-150 dark:bg-slate-800/50 animate-pulse" />
      </div>
    </section>
  );
};

/**
 * Content-specific Skeleton for Right Desktop Suggestions Sidebar.
 * Matches current user header, suggestions list, and footer.
 */
export const SuggestionsSidebarSkeleton: React.FC = () => {
  return (
    <aside
      id="desktop-suggestions-sidebar-skeleton"
      className="hidden lg:block w-[320px] p-6 space-y-6 shrink-0 select-none"
    >
      {/* Current User Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ring-1 ring-slate-200 dark:ring-slate-800" />
          <div className="space-y-1.5">
            <div className="w-24 h-3.5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="w-18 h-2.5 rounded bg-slate-150 dark:bg-slate-800/60 animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-4 rounded bg-indigo-100 dark:bg-indigo-950/60 animate-pulse" />
      </div>

      {/* Suggestions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-28 h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-12 h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Suggested Creator Rows */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`sidebar-suggested-${i}`} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div
                    style={{ width: `${80 + (i % 3) * 12}px` }}
                    className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                  <div
                    style={{ width: `${56 + (i % 2) * 16}px` }}
                    className="h-2 rounded bg-slate-150 dark:bg-slate-800/60 animate-pulse"
                  />
                </div>
              </div>
              <div className="w-14 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links Skeleton */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
        <div className="w-48 h-2 rounded bg-slate-150 dark:bg-slate-800/40 animate-pulse" />
        <div className="w-32 h-2 rounded bg-slate-150 dark:bg-slate-800/30 animate-pulse" />
      </div>
    </aside>
  );
};

/**
 * Complete, orchestrated Skeleton Screen Loader for HomePage Feed.
 * Renders the full viewport layout (stories, algorithm filter controls, posts, and suggestions sidebar)
 * during data fetching to eliminate layout shift and optimize perceived performance.
 */
export const HomePageFeedSkeleton: React.FC = () => {
  return (
    <div
      id="homepage-feed-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading HomePage feed"
      className="flex justify-center max-w-[960px] mx-auto py-6 px-2 md:px-6 gap-8 select-none animate-in fade-in duration-200"
    >
      {/* Center Feed Column */}
      <main className="w-full max-w-[480px] flex flex-col items-center shrink-0">
        {/* Offline Cache Status Bar Skeleton */}
        <div className="w-full mb-4 px-3 py-2 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-slate-700" />
            <div className="w-32 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="w-16 h-5 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Stories Bar Skeleton */}
        <StoriesBarSkeleton />

        {/* Feed Algorithm Controls Skeleton */}
        <FeedAlgorithmControlsSkeleton />

        {/* Feed Posts Skeletons */}
        <FeedPostSkeleton count={3} />
      </main>

      {/* Right Desktop Suggestions Column Skeleton */}
      <SuggestionsSidebarSkeleton />
    </div>
  );
};

/**
 * Content-specific Skeleton for Reels Viewport.
 * Matches the vertical 9:16 aspect ratio, bottom creator metadata overlay,
 * and floating action controls bar.
 */
export const ReelSkeleton: React.FC = () => {
  return (
    <div
      id="reel-skeleton-container"
      className="flex items-center justify-center min-h-[calc(100vh-80px)] md:min-h-screen py-2 px-2 select-none"
    >
      <div className="relative flex items-center gap-4">
        {/* Main 9:16 Reel Viewport */}
        <div className="relative w-full max-w-[380px] h-[80vh] max-h-[750px] aspect-9/16 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl animate-shimmer">
          {/* Subtle Watermark in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-700">
            <Film className="w-12 h-12 stroke-[1.2] opacity-50" />
            <div className="w-24 h-2.5 rounded-full bg-neutral-800 animate-pulse" />
          </div>

          {/* Top-Right Sound Icon Skeleton */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800/80 animate-pulse" />

          {/* Bottom Overlay Skeleton */}
          <div className="absolute bottom-0 inset-x-0 p-4 pt-14 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-3 z-10">
            {/* User Row */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-800 animate-pulse ring-2 ring-neutral-700/60 shrink-0" />
              <div className="w-24 h-3.5 rounded-md bg-neutral-800 animate-pulse" />
              <div className="w-16 h-6 rounded-lg bg-neutral-800/80 animate-pulse" />
            </div>

            {/* Caption Bars */}
            <div className="space-y-1.5">
              <div className="w-5/6 h-3 rounded-md bg-neutral-800 animate-pulse" />
              <div className="w-3/5 h-3 rounded-md bg-neutral-800/80 animate-pulse" />
            </div>

            {/* Audio Track Bar */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-3.5 h-3.5 rounded-full bg-neutral-800 animate-pulse shrink-0" />
              <div className="w-36 h-2.5 rounded-md bg-neutral-800/70 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Floating Actions Column Skeleton */}
        <div className="flex flex-col items-center gap-5">
          {/* Like */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-800 animate-pulse" />
            <div className="w-6 h-2 rounded-md bg-neutral-300 dark:bg-neutral-800 animate-pulse" />
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-800 animate-pulse" />
            <div className="w-6 h-2 rounded-md bg-neutral-300 dark:bg-neutral-800 animate-pulse" />
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-800 animate-pulse" />
            <div className="w-6 h-2 rounded-md bg-neutral-300 dark:bg-neutral-800 animate-pulse" />
          </div>

          {/* Bookmark */}
          <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-800 animate-pulse" />

          {/* Vinyl Disc Skeleton */}
          <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-800 ring-4 ring-neutral-400 dark:ring-neutral-700 animate-pulse mt-2" />

          {/* Up/Down Navigation Skeletons */}
          <div className="flex flex-col gap-1.5 mt-4">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Content-specific Skeleton for Profile View.
 * Matches profile header geometry, bio, stats, story highlights, and grid posts.
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <div id="profile-skeleton-view" className="w-full max-w-4xl mx-auto py-6 px-3 md:px-8 select-none animate-in fade-in duration-200">
      {/* Top Header Card Skeleton */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 pb-8 border-b border-slate-200 dark:border-zinc-800/80">
        {/* Avatar Skeleton */}
        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-slate-200 dark:bg-zinc-800 animate-pulse shrink-0 ring-4 ring-slate-100 dark:ring-zinc-800/50" />

        {/* Info Column Skeleton */}
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          {/* Top Row: Username & Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="w-36 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-10 h-3 rounded-md bg-slate-100 dark:bg-zinc-800/60 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-14 h-3 rounded-md bg-slate-100 dark:bg-zinc-800/60 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-14 h-3 rounded-md bg-slate-100 dark:bg-zinc-800/60 animate-pulse" />
            </div>
          </div>

          {/* Bio Lines */}
          <div className="space-y-2 pt-1 max-w-md mx-auto md:mx-0">
            <div className="w-32 h-3.5 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-full h-3 rounded-md bg-slate-150 dark:bg-zinc-800/70 animate-pulse" />
            <div className="w-3/4 h-3 rounded-md bg-slate-150 dark:bg-zinc-800/70 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Story Highlights Skeleton Row */}
      <div className="py-6 flex items-center gap-5 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-zinc-800/60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`highlight-skel-${i}`} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-slate-200 dark:bg-zinc-800 p-0.5 animate-pulse ring-2 ring-slate-100 dark:ring-zinc-800" />
            <div className="w-12 h-2.5 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex items-center justify-around py-4 border-b border-slate-200 dark:border-zinc-800/60">
        <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
        <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
        <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
        <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-zinc-800 animate-pulse" />
      </div>

      {/* Grid Posts Skeleton */}
      <div className="grid grid-cols-3 gap-1 md:gap-3 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`profile-grid-skel-${i}`}
            className="aspect-square rounded-lg md:rounded-xl bg-slate-200 dark:bg-zinc-800/90 animate-pulse overflow-hidden relative flex items-center justify-center"
          >
            <ImageIcon className="w-8 h-8 text-slate-300 dark:text-zinc-700 stroke-[1.2]" />
          </div>
        ))}
      </div>
    </div>
  );
};
