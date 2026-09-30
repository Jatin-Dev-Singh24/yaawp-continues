// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Activity,
  Layers,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Film,
  Calendar,
  Smile,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Post, Reel, UserProfile } from '../types';

interface AnalyticsViewProps {
  profile: UserProfile;
  userPosts: Post[];
  userReels?: Reel[];
  isOwnProfile?: boolean;
}

type TimeRange = '7d' | '30d' | '90d';

const COLORS = {
  primary: '#6366f1', // indigo-500
  secondary: '#a855f7', // purple-500
  rose: '#f43f5e', // rose-500
  emerald: '#10b981', // emerald-500
  amber: '#f59e0b', // amber-500
  cyan: '#06b6d4', // cyan-500
  gray: '#71717a'
};

const PIE_COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  userPosts,
  userReels = [],
  isOwnProfile = true
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Compute strictly real engagement statistics from user's posts
  const realStats = useMemo(() => {
    let totalLikes = 0;
    let totalComments = 0;
    let totalSaves = 0;
    let totalReactions = 0;

    userPosts.forEach(post => {
      totalLikes += post.likesCount || 0;
      totalComments += (post.comments ? post.comments.length : (post.commentsCount || 0));
      if (post.isSaved) totalSaves += 1;

      // Count actual reactions
      if (post.reactions) {
        Object.values(post.reactions).forEach(val => {
          if (Array.isArray(val)) {
            totalReactions += val.length;
          } else if (typeof val === 'number') {
            totalReactions += val;
          }
        });
      }
    });

    userReels.forEach(reel => {
      totalLikes += reel.likesCount || 0;
      totalComments += reel.commentsCount || 0;
    });

    const totalPostsCount = userPosts.length;
    const totalEngagements = totalLikes + totalComments + totalSaves + totalReactions;
    const avgLikesPerPost = totalPostsCount > 0 ? (totalLikes / totalPostsCount).toFixed(1) : '0';
    const avgCommentsPerPost = totalPostsCount > 0 ? (totalComments / totalPostsCount).toFixed(1) : '0';

    return {
      totalPostsCount,
      totalLikes,
      totalComments,
      totalSaves,
      totalReactions,
      totalEngagements,
      avgLikesPerPost,
      avgCommentsPerPost
    };
  }, [userPosts, userReels]);

  // Real historical timeline derived solely from real posts created within time range
  const { timelineData, contentBreakdownData } = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const dayMap = new Map<string, { date: string; postsCount: number; likes: number; comments: number }>();

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap.set(key, {
        date: dateLabel,
        postsCount: 0,
        likes: 0,
        comments: 0
      });
    }

    // Populate with real post data
    userPosts.forEach(post => {
      const postTime = post.createdAt || Date.now();
      const dateStr = new Date(postTime).toISOString().split('T')[0];
      if (dayMap.has(dateStr)) {
        const item = dayMap.get(dateStr)!;
        item.postsCount += 1;
        item.likes += post.likesCount || 0;
        item.comments += (post.comments ? post.comments.length : (post.commentsCount || 0));
      }
    });

    const timeline = Array.from(dayMap.values());

    // Real content format distribution
    const imagePostsCount = userPosts.filter(p => !p.isTextPost && !p.videoUrl && p.postType !== 'video').length;
    const videoPostsCount = userPosts.filter(p => p.videoUrl || p.postType === 'video').length + userReels.length;
    const textPostsCount = userPosts.filter(p => p.isTextPost || p.postType === 'text').length;
    const totalMediaItems = imagePostsCount + videoPostsCount + textPostsCount;

    const breakdown = totalMediaItems > 0 ? [
      {
        name: 'Photos',
        count: imagePostsCount,
        value: Math.round((imagePostsCount / totalMediaItems) * 100)
      },
      {
        name: 'Videos & Reels',
        count: videoPostsCount,
        value: Math.round((videoPostsCount / totalMediaItems) * 100)
      },
      {
        name: 'Text Thoughts',
        count: textPostsCount,
        value: Math.round((textPostsCount / totalMediaItems) * 100)
      }
    ] : [
      { name: 'Photos', count: 0, value: 0 },
      { name: 'Videos & Reels', count: 0, value: 0 },
      { name: 'Text Thoughts', count: 0, value: 0 }
    ];

    return {
      timelineData: timeline,
      contentBreakdownData: breakdown
    };
  }, [timeRange, userPosts, userReels]);

  // Sort real posts by real engagement
  const rankedPosts = useMemo(() => {
    return [...userPosts].sort((a, b) => {
      const engA = (a.likesCount || 0) + (a.comments ? a.comments.length : (a.commentsCount || 0)) + (a.isSaved ? 1 : 0);
      const engB = (b.likesCount || 0) + (b.comments ? b.comments.length : (b.commentsCount || 0)) + (b.isSaved ? 1 : 0);
      return engB - engA;
    });
  }, [userPosts]);

  return (
    <div id="analytics-view" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500 text-white flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Creator Analytics
            </span>
            <span className="text-xs text-slate-400">@{profile.username}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Real Posts & Engagement Overview
          </h2>
          <p className="text-xs text-slate-400">
            Authentic statistics calculated directly from your published posts, photos, and interactions.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-center">
          {(['7d', '30d', '90d'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid - Real Data Only */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Posts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Posts</span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {realStats.totalPostsCount}
          </div>
          <div className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
            {realStats.totalPostsCount === 1 ? '1 post shared' : `${realStats.totalPostsCount} posts shared`}
          </div>
        </div>

        {/* Total Likes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Likes</span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {realStats.totalLikes.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
            Avg {realStats.avgLikesPerPost} per post
          </div>
        </div>

        {/* Total Comments */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Comments</span>
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-500">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {realStats.totalComments.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
            Avg {realStats.avgCommentsPerPost} per post
          </div>
        </div>

        {/* Total Reactions & Saves */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Reactions</span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {realStats.totalReactions.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
            {realStats.totalSaves} saved bookmarks
          </div>
        </div>
      </div>

      {/* Real Posts Engagement Timeline Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Real Daily Post Engagement
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Actual likes and comments received by your posts across the selected timeframe
          </p>
        </div>

        {realStats.totalPostsCount > 0 ? (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={timeRange === '90d' ? 6 : timeRange === '30d' ? 2 : 0}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="likes"
                  name="Likes"
                  stroke={COLORS.rose}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#likesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="comments"
                  name="Comments"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#commentsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-zinc-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-zinc-600 opacity-60" />
            <p className="font-semibold text-slate-700 dark:text-zinc-300">No post engagement recorded yet</p>
            <p className="mt-1">Publish posts to generate real interaction timelines.</p>
          </div>
        )}
      </div>

      {/* Grid: Real Content Breakdown & Top Posts Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content Type Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Content Format Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Distribution of your published media formats
            </p>
          </div>

          {realStats.totalPostsCount > 0 ? (
            <>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {contentBreakdownData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} items`, 'Count']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                {contentBreakdownData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-700 dark:text-zinc-300 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                        ({item.value}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
              No content published yet to break down.
            </div>
          )}
        </div>

        {/* Top Posts Leaderboard */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Your Posts Ranked by Engagement
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Real engagement on each post
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
              {userPosts.length} posts analyzed
            </span>
          </div>

          {rankedPosts.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-72 overflow-y-auto pr-1">
              {rankedPosts.slice(0, 5).map((post, idx) => {
                const totalEng = (post.likesCount || 0) + (post.comments ? post.comments.length : (post.commentsCount || 0));

                return (
                  <div key={post.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 w-4">
                        #{idx + 1}
                      </span>
                      {post.isTextPost || (!post.mediaUrls?.[0] && !post.videoUrl) ? (
                        <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-500 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      ) : (
                        <img
                          src={post.mediaUrls[0]}
                          alt={post.caption || 'Post image'}
                          className="w-11 h-11 rounded-lg object-cover bg-zinc-800 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                          {post.caption || (post.isTextPost ? 'Text thought' : 'Photo post')}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                            {post.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-indigo-400" />
                            {post.comments ? post.comments.length : (post.commentsCount || 0)}
                          </span>
                          {post.isSaved && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <Bookmark className="w-3 h-3 fill-amber-500" />
                              Saved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {totalEng.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">interactions</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {post.timestamp || 'Published'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
              Publish photos or thoughts to view individual performance rankings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
