import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Share2,
  MoreVertical,
  Plus,
  Flame,
  Clock,
  Award,
  Pin,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Trash2,
  Edit3,
  Flag,
  EyeOff,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  Upload,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Community, Discussion, Comment } from '../types';
import { CommunityJoinButton } from './CommunityJoinButton';
import { CommunityChannelsChat } from './CommunityChannelsChat';
import { ThreadedCommentTree } from './ThreadedCommentTree';
import { convertImageToWebP } from '../utils/mediaConverter';

interface CommunityDetailViewProps {
  community: Community;
  onBack: () => void;
}

export const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({ community, onBack }) => {
  const {
    currentUser,
    discussions,
    createDiscussion,
    voteDiscussion,
    addDiscussionComment,
    voteDiscussionComment,
    likeDiscussionComment,
    deleteDiscussionComment,
    openUserProfile,
    pinDiscussion,
    updateCommunity,
    deleteCommunity,
    reportCommunity,
    toggleHideCommunity,
    joinRequests,
    handleJoinRequest,
    joinCommunity,
    showToast
  } = useApp();

  const isOwner = community.ownerId === currentUser.id;
  const isModerator = isOwner || (community.moderators && community.moderators.includes(currentUser.id));

  // Sorting & Navigation
  const [communityTab, setCommunityTab] = useState<'discussions' | 'chat'>('discussions');
  const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals & Panels
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isEditCommunityOpen, setIsEditCommunityOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showModQueue, setShowModQueue] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // New Thread State
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicBody, setNewTopicBody] = useState('');
  const [newTopicTag, setNewTopicTag] = useState('Discussion');
  const [newTopicMedia, setNewTopicMedia] = useState('');

  // Edit Community State
  const [editName, setEditName] = useState(community.name);
  const [editDescription, setEditDescription] = useState(community.description);
  const [editAbout, setEditAbout] = useState(community.about || '');

  // Report State
  const [reportReason, setReportReason] = useState('Off-topic or spam');

  // Active expanded thread for viewing full replies
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

  // Pending requests for this community
  const pendingRequests = joinRequests.filter(
    r => r.communityId === community.id && r.status === 'pending'
  );

  // Filter & Sort Discussions
  const communityDiscussions = discussions.filter(d => d.communityId === community.id);

  const filteredDiscussions = communityDiscussions
    .filter(d => !selectedTag || (d.tags && d.tags.includes(selectedTag)))
    .sort((a, b) => {
      // Pinned items always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (activeSort === 'top') {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (activeSort === 'new') {
        return b.id.localeCompare(a.id);
      }
      // Hot: engagement score (upvotes * 2 + comments)
      const scoreA = (a.upvotes - a.downvotes) * 2 + a.commentsCount;
      const scoreB = (b.upvotes - b.downvotes) * 2 + b.commentsCount;
      return scoreB - scoreA;
    });

  const handleCreateTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicBody.trim()) return;

    createDiscussion({
      communityId: community.id,
      title: newTopicTitle.trim(),
      body: newTopicBody.trim(),
      tags: [newTopicTag],
      mediaUrl: newTopicMedia.trim() || undefined
    });

    setNewTopicTitle('');
    setNewTopicBody('');
    setNewTopicMedia('');
    setIsCreateTopicOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommunity(community.id, {
      name: editName,
      description: editDescription,
      about: editAbout
    });
    setIsEditCommunityOpen(false);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportCommunity(community.id, reportReason);
    setIsReportModalOpen(false);
  };

  const copyInviteLink = () => {
    const link = `https://lumina.app/c/${community.slug}?invite=${community.inviteCode || 'VIP_ACCESS'}`;
    navigator.clipboard?.writeText(link);
    setCopiedInvite(true);
    showToast('Community invite link copied to clipboard!');
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleAddReply = (discussionId: string) => {
    if (!replyText.trim()) return;
    addDiscussionComment(discussionId, replyText.trim(), replyingToCommentId || undefined);
    setReplyText('');
    setReplyingToCommentId(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 md:px-6">
      {/* Top Back Navigation & Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Communities</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Invite Code / Link Button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite Link</span>
          </button>

          {/* Hide Community Toggle */}
          <button
            onClick={() => toggleHideCommunity(community.id)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
            title={community.isHidden ? 'Unhide Community' : 'Hide Community'}
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Report Button (for non-owners) */}
          {!isOwner && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors"
              title="Report Community"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          {/* Owner / Moderator Controls */}
          {isModerator && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditCommunityOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              {isOwner && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${community.name}"? This action cannot be undone.`)) {
                      deleteCommunity(community.id);
                      onBack();
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                  title="Delete Community"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6">
        <div className="relative h-44 md:h-56 w-full overflow-hidden bg-slate-900">
          <img
            src={community.bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white">
              {community.isPrivate ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Private Collective
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Public Collective
                </>
              )}
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={community.avatar}
                alt={community.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-md bg-slate-800"
              />
              <div className="mb-1">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {community.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  c/{community.slug} • Managed by @{community.ownerName || 'curator'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CommunityJoinButton
                communityId={community.id}
                isJoined={community.isJoined}
                size="lg"
              />
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed mb-4">
            {community.description}
          </p>

          {/* Topic Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedTag === null
                  ? 'bg-lime-500 text-zinc-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Topics
            </button>
            {community.topicTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTag === tag
                    ? 'bg-lime-500 text-zinc-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Moderator Queue Bar (if private & has pending requests & user is mod) */}
      {isModerator && community.isPrivate && pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                  Moderator Queue: {pendingRequests.length} Pending Join {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Members waiting for approval to access this private community.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModQueue(!showModQueue)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition-colors"
            >
              {showModQueue ? 'Hide Queue' : 'Review Requests'}
            </button>
          </div>

          {showModQueue && (
            <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-2">
              {pendingRequests.map(req => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.user.avatar}
                      alt={req.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {req.user.name} (@{req.user.username})
                      </span>
                      <p className="text-[11px] text-slate-500">{req.message || 'Requested to join'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinRequest(community.id, req.id, 'accept')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleJoinRequest(community.id, req.id, 'decline')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-rose-100 hover:text-rose-600"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Community Section Switcher: Forum Discussions vs Live Channels Chat */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setCommunityTab('discussions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            communityTab === 'discussions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discussions & Threads</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-current">
            {communityDiscussions.length}
          </span>
        </button>

        <button
          onClick={() => setCommunityTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            communityTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <span className="font-mono text-sm">#</span>
          <span>Live Channels & Chat</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {communityTab === 'chat' ? (
        <CommunityChannelsChat community={community} />
      ) : (
        /* Main Reddit-Like Grid: Feed on left, Community Sidebar on right */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Topics / Threads */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Bar: Sort & Create Thread */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 px-3 shadow-xs">
            {/* Sort Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSort('hot')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSort === 'hot'
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Hot</span>
              </button>

              <button
                onClick={() => setActiveSort('new')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSort === 'new'
                    ? 'bg-lime-500/10 text-lime-600 dark:text-lime-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              <button
                onClick={() => setActiveSort('top')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSort === 'top'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Top</span>
              </button>
            </div>

            {/* Create Topic Button */}
            <button
              onClick={() => setIsCreateTopicOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Thread</span>
            </button>
          </div>

          {/* Topics List */}
          <div className="space-y-3">
            {filteredDiscussions.map(disc => {
              const score = disc.upvotes - disc.downvotes;
              const isExpanded = expandedDiscussionId === disc.id;

              return (
                <article
                  key={disc.id}
                  id={`discussion-card-${disc.id}`}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all ${
                    disc.isPinned
                      ? 'border-lime-500/50 bg-lime-500/5 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex">
                    {/* Left Reddit-style Upvote/Downvote Column */}
                    <div className="w-12 bg-slate-50 dark:bg-slate-800/40 p-2 flex flex-col items-center justify-start gap-1 border-r border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => voteDiscussion(disc.id, 'up')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          disc.userVote === 'up'
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                        }`}
                        title="Upvote"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>

                      <span
                        className={`text-xs font-black my-0.5 ${
                          disc.userVote === 'up'
                            ? 'text-orange-600 dark:text-orange-400'
                            : disc.userVote === 'down'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {score}
                      </span>

                      <button
                        onClick={() => voteDiscussion(disc.id, 'down')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          disc.userVote === 'down'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                        }`}
                        title="Downvote"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Right Main Content */}
                    <div className="flex-1 p-4">
                      {/* Meta header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                          {disc.isPinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-lime-500/20 text-lime-700 dark:text-lime-300 font-bold text-[10px]">
                              <Pin className="w-3 h-3 fill-lime-500" />
                              PINNED
                            </span>
                          )}
                          {disc.tags?.map(t => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                            >
                              [{t}]
                            </span>
                          ))}
                          <span>
                            Posted by <strong className="text-slate-700 dark:text-slate-300">@{disc.author.username}</strong>
                          </span>
                          <span>• {disc.createdAt || 'Recent'}</span>
                        </div>

                        {/* Mod Controls */}
                        {isModerator && (
                          <button
                            onClick={() => pinDiscussion(disc.id)}
                            className={`p-1.5 rounded-lg text-xs font-semibold ${
                              disc.isPinned
                                ? 'text-lime-600 bg-lime-50 dark:bg-lime-950/40'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                            title={disc.isPinned ? 'Unpin thread' : 'Pin thread to top'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Title & Body */}
                      <h3
                        onClick={() => setExpandedDiscussionId(isExpanded ? null : disc.id)}
                        className="font-bold text-base text-slate-900 dark:text-white hover:text-lime-600 dark:hover:text-lime-400 cursor-pointer mb-2 transition-colors"
                      >
                        {disc.title}
                      </h3>

                      <p className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3 ${
                        !isExpanded ? 'line-clamp-3' : ''
                      }`}>
                        {disc.body}
                      </p>

                      {/* Optional Media */}
                      {disc.mediaUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden max-h-72 bg-slate-950">
                          <img
                            src={disc.mediaUrl}
                            alt={disc.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Thread footer */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
                        <button
                          onClick={() => setExpandedDiscussionId(isExpanded ? null : disc.id)}
                          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{disc.commentsCount} Comments</span>
                        </button>
                      </div>

                      {/* Expanded Comments Section with Threaded Comment Tree */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>Thread Discussion</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                {disc.commentsCount}
                              </span>
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              Threaded replies enabled
                            </span>
                          </div>

                          {/* Top-Level Reply Input Bar */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddReply(disc.id);
                                }
                              }}
                              placeholder="Post a comment to this thread... (Press Enter)"
                              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-lime-500"
                            />
                            <button
                              onClick={() => handleAddReply(disc.id)}
                              disabled={!replyText.trim()}
                              className="px-3.5 py-2 rounded-xl bg-lime-500 text-zinc-950 font-bold hover:bg-lime-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reply</span>
                            </button>
                          </div>

                          {/* Threaded Comments Tree */}
                          <div className="pt-2">
                            {disc.comments && disc.comments.length > 0 ? (
                              <ThreadedCommentTree
                                comments={disc.comments}
                                onAddReply={(parentId, text) => {
                                  addDiscussionComment(disc.id, text, parentId);
                                }}
                                onLikeComment={(commentId) => {
                                  likeDiscussionComment(disc.id, commentId);
                                }}
                                onDeleteComment={(commentId) => {
                                  deleteDiscussionComment(disc.id, commentId);
                                }}
                                onOpenUserProfile={openUserProfile}
                                currentUserId={currentUser.id}
                                maxIndentLevel={4}
                              />
                            ) : (
                              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                No replies yet. Start the thread or share your perspective!
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredDiscussions.length === 0 && (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  No topics found in this collective
                </h4>
                <p className="text-xs text-slate-500">
                  Be the first member to start a new discussion or ask a question!
                </p>
                <button
                  onClick={() => setIsCreateTopicOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-lime-500 text-zinc-950 text-xs font-bold"
                >
                  Post First Thread
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Community Rules & Info Sidebar */}
        <div className="space-y-5">
          {/* About Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              About Collective
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {community.about || community.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-sm">
                  {community.membersCount.toLocaleString()}
                </span>
                <span className="text-slate-400 text-[11px]">Members</span>
              </div>
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-sm">
                  {communityDiscussions.length}
                </span>
                <span className="text-slate-400 text-[11px]">Threads</span>
              </div>
            </div>
          </div>

          {/* Guidelines / Rules Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-lime-500" />
              <span>Collective Rules</span>
            </h3>

            <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {(community.rules || [
                'Be respectful to all creators',
                'Share constructive feedback',
                'Keep content relevant to the collective theme'
              ]).map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-lime-600 dark:text-lime-400">{idx + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Moderators Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Moderators</span>
            </h3>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>@{community.ownerName || 'curator'} (Founder)</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Modal: Create Thread */}
      {isCreateTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Thread in {community.name}
            </h3>

            <form onSubmit={handleCreateTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thread Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Best settings for golden hour photography?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Flair
                </label>
                <select
                  value={newTopicTag}
                  onChange={e => setNewTopicTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Discussion">Discussion</option>
                  <option value="Showcase">Showcase & Critique</option>
                  <option value="Question">Help & Question</option>
                  <option value="Gear">Gear & Setup</option>
                  <option value="Tutorial">Tutorial / Tips</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thread Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newTopicBody}
                  onChange={e => setNewTopicBody(e.target.value)}
                  placeholder="Share details, context, or ask questions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Media Attachment (Image URL or Upload)
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={newTopicMedia}
                    onChange={e => setNewTopicMedia(e.target.value)}
                    placeholder="Paste image link or upload below..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-lime-500 cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <Upload className="w-3.5 h-3.5 text-lime-500" />
                      <span>Upload image from device (PNG, JPG, WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const result = await convertImageToWebP(file);
                              setNewTopicMedia(result.dataUrl);
                            } catch {
                              const reader = new FileReader();
                              reader.onload = () => setNewTopicMedia(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  {newTopicMedia && (
                    <div className="relative aspect-video max-h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={newTopicMedia} alt="Thread media preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewTopicMedia('')}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white text-[10px] hover:bg-black/80"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateTopicOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 text-zinc-950 text-xs font-bold hover:bg-lime-400"
                >
                  Publish Thread
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Invite Link */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-lime-500" />
              <span>Invite Link for {community.name}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Share this secret invite link. For private communities, people joining with this link are granted instant admission!
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
              https://lumina.app/c/{community.slug}?invite={community.inviteCode || 'VIP_ACCESS'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                Close
              </button>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-500 text-zinc-950 font-bold text-xs hover:bg-lime-400"
              >
                {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInvite ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Report Community */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-500" />
              <span>Report Community</span>
            </h3>
            <p className="text-xs text-slate-500">
              Flag this community to Lumina safety moderators. Please select a reason:
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              {[
                'Spam or unauthorized commercial promotion',
                'Harassment, hate speech, or bullying',
                'Inappropriate or copyrighted media',
                'Misleading or harmful community topics',
                'Other safety violation'
              ].map(reason => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs text-slate-800 dark:text-slate-200"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={e => setReportReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Community */}
      {isEditCommunityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-lime-500" />
              <span>Edit Collective Details</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  About Info
                </label>
                <textarea
                  rows={3}
                  value={editAbout}
                  onChange={e => setEditAbout(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditCommunityOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 text-zinc-950 font-bold text-xs hover:bg-lime-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
