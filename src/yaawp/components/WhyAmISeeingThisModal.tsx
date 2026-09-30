// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import {
  X,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  VolumeX,
  UserX,
  Tag,
  Users,
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';

interface WhyAmISeeingThisModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyAmISeeingThisModal: React.FC<WhyAmISeeingThisModalProps> = ({
  post,
  isOpen,
  onClose
}) => {
  const {
    followedUserIds,
    communities,
    algorithmSettings,
    applyAlgorithmFeedback,
    currentUser
  } = useApp();

  if (!isOpen || !post) return null;

  const isFollowing = followedUserIds.includes(post.user.id);
  const community = post.communityId ? communities.find(c => c.id === post.communityId) : null;
  const isSelf = post.user.id === currentUser.id;

  // Derive explicit reason why user sees this post
  const reasons: { title: string; desc: string; icon: React.ReactNode }[] = [];

  if (isSelf) {
    reasons.push({
      title: 'Your own post',
      desc: 'You published this post to your profile.',
      icon: <Users className="w-4 h-4 text-indigo-500" />
    });
  } else if (isFollowing) {
    reasons.push({
      title: `You follow @${post.user.username}`,
      desc: 'Posts from creators you follow are prioritized in your feed.',
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-500" />
    });
  }

  if (community) {
    reasons.push({
      title: `Posted in ${community.name}`,
      desc: community.isJoined
        ? 'You are an active member of this community.'
        : 'This community is active and aligns with creative topics you explore.',
      icon: <Users className="w-4 h-4 text-purple-500" />
    });
  }

  if (post.tags && post.tags.length > 0) {
    const matchedAffinity = post.tags.find(t => {
      const clean = t.toLowerCase().replace('#', '');
      return (algorithmSettings.topicAffinities[clean] || 0) > 0;
    });

    if (matchedAffinity) {
      reasons.push({
        title: `Interested in ${matchedAffinity}`,
        desc: `You frequently like and engage with content tagged ${matchedAffinity}.`,
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />
      });
    } else {
      reasons.push({
        title: 'Discovered via Topic Tags',
        desc: `Post contains relevant hashtags: ${post.tags.slice(0, 3).join(', ')}`,
        icon: <Tag className="w-4 h-4 text-amber-500" />
      });
    }
  }

  if (reasons.length === 0) {
    reasons.push({
      title: 'Popular in Discovery',
      desc: 'Engaged with by creators with similar interests in your network.',
      icon: <Compass className="w-4 h-4 text-indigo-500" />
    });
  }

  return (
    <div
      id="why-am-i-seeing-this-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Why am I seeing this?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Post Snippet */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <img
              src={post.mediaUrls[0]}
              alt="Post thumbnail"
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                @{post.user.username}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {post.caption}
              </div>
            </div>
          </div>

          {/* Rationale List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Signals Influencing This Recommendation
            </div>
            {reasons.map((r, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-850"
              >
                <div className="shrink-0 mt-0.5">{r.icon}</div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {r.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {r.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tune Your Algorithm
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  applyAlgorithmFeedback(post.id, 'more_like_this');
                  onClose();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                More like this
              </button>

              <button
                type="button"
                onClick={() => {
                  applyAlgorithmFeedback(post.id, 'less_like_this');
                  onClose();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ThumbsDown className="w-4 h-4 text-rose-500" />
                Less like this
              </button>
            </div>

            {/* Mute Topics if post has tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Mute Topic:</div>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 4).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        applyAlgorithmFeedback(post.id, 'mute_topic', tag);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Mute {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mute Community if post from community */}
            {community && (
              <button
                type="button"
                onClick={() => {
                  applyAlgorithmFeedback(post.id, 'mute_community', undefined, community.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  Mute {community.name} in feed
                </span>
                <span className="text-[11px] text-slate-400">Hide posts</span>
              </button>
            )}

            {/* Don't recommend this person */}
            {!isSelf && (
              <button
                type="button"
                onClick={() => {
                  applyAlgorithmFeedback(post.id, 'mute_person');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  Don't recommend @{post.user.username}
                </span>
                <span className="text-[11px] opacity-75">Mute creator</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
