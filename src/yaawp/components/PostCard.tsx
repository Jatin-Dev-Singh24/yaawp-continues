// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Smile,
  CheckCircle2,
  HelpCircle,
  Repeat,
  Lock,
  Users,
  Sparkles,
  X,
  Trash2,
  Archive,
  Sliders,
  Plus,
  Clock,
  Flag,
  Ban,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  FileText,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { WhyAmISeeingThisModal } from './WhyAmISeeingThisModal';
import { PostReactionsModal } from './PostReactionsModal';
import { PostEmojiSettingsModal } from './PostEmojiSettingsModal';
import { ConfirmationModal } from './ConfirmationModal';
import { SharePostModal } from './SharePostModal';
import { EmojiPickerModal } from './EmojiPickerModal';
import { ReportPostModal } from './ReportPostModal';
import { FormattedText } from './FormattedText';
import { EmojiKitchenModal } from './EmojiKitchenModal';
import { EmojiBlendSuggestionBanner } from './EmojiBlendSuggestionBanner';
import {
  detectEmojiBlendInText,
  formatBlendToken,
  getBlendById,
  EmojiBlend
} from '../data/emojiKitchen';

interface PostCardProps {
  post: Post;
}

const DEFAULT_REACTION_EMOJIS = ['❤️', '🔥', '👏', '🎨', '💡', '📸', '😂', '😍'];

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    toggleLikePost,
    toggleSavePost,
    addComment,
    setSelectedPostForModal,
    showToast,
    toggleFollowUser,
    openUserProfile,
    startConversationWithUser,
    followedUserIds,
    reactToPost,
    quotePost,
    customCircles,
    currentUser,
    updatePostEmojiSettings,
    deletePost,
    archivePost,
    blockUser,
    posts,
    allUsers,
    t
  } = useApp();

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [showCommentKitchenModal, setShowCommentKitchenModal] = useState(false);
  const [dismissedCommentBlendKey, setDismissedCommentBlendKey] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteCaption, setQuoteCaption] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showTopReactionsModal, setShowTopReactionsModal] = useState(false);
  const [showEmojiSettingsModal, setShowEmojiSettingsModal] = useState(false);
  const [isHoldingHeart, setIsHoldingHeart] = useState(false);
  const [isHoldingCount, setIsHoldingCount] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    variant: 'danger'
  });

  const heartHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHeartLongPressRef = useRef(false);
  const countHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCountLongPressRef = useRef(false);

  // Video playback states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const toggleVideoPlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const isFollowingAuthor = followedUserIds.includes(post.user.id);
  const isOwnPost =
    post.user.id === currentUser.id ||
    Boolean(
      post.user.username &&
      currentUser.username &&
      post.user.username.toLowerCase() === currentUser.username.toLowerCase()
    );
  const lastTapRef = useRef<number>(0);

  // Filter allowed emojis for reactions
  const availableEmojis = useMemo(() => {
    if (post.allowedEmojis && post.allowedEmojis.length > 0) {
      return post.allowedEmojis;
    }
    return DEFAULT_REACTION_EMOJIS;
  }, [post.allowedEmojis]);

  // Calculate total reactions count
  const totalReactionsCount = useMemo(() => {
    if (!post.reactions || Object.keys(post.reactions).length === 0) {
      return post.likesCount;
    }
    let count = 0;
    Object.values(post.reactions).forEach(uids => {
      count += Array.isArray(uids) ? uids.length : 1;
    });
    return Math.max(post.likesCount, count);
  }, [post.reactions, post.likesCount]);

  // Heart button hold handlers (3 seconds = open reaction bar, short click = like/unlike)
  const startHeartHold = () => {
    isHeartLongPressRef.current = false;
    setIsHoldingHeart(true);
    heartHoldTimerRef.current = setTimeout(() => {
      isHeartLongPressRef.current = true;
      setShowReactionPicker(true);
      setIsHoldingHeart(false);
    }, 2000);
  };

  const cancelHeartHold = () => {
    if (heartHoldTimerRef.current) {
      clearTimeout(heartHoldTimerRef.current);
      heartHoldTimerRef.current = null;
    }
    setIsHoldingHeart(false);
  };

  const handleHeartClick = () => {
    if (!isHeartLongPressRef.current) {
      toggleLikePost(post.id);
    }
  };

  // Reactions count hold handlers (3 seconds = open top 5 reactions modal, click also opens modal)
  const startCountHold = () => {
    isCountLongPressRef.current = false;
    setIsHoldingCount(true);
    countHoldTimerRef.current = setTimeout(() => {
      isCountLongPressRef.current = true;
      setShowTopReactionsModal(true);
      setIsHoldingCount(false);
    }, 1500);
  };

  const cancelCountHold = () => {
    if (countHoldTimerRef.current) {
      clearTimeout(countHoldTimerRef.current);
      countHoldTimerRef.current = null;
    }
    setIsHoldingCount(false);
  };

  const handleCountClick = () => {
    setShowTopReactionsModal(true);
  };

  // Double tap to like handler
  const handleMediaClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setShowHeartAnimation(true);
      if (!post.isLiked) {
        toggleLikePost(post.id);
      }
      setTimeout(() => setShowHeartAnimation(false), 900);
    }
    lastTapRef.current = now;
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIndex < post.mediaUrls.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setCommentText(prev => prev + emoji);
  };

  const copyPostLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link copied to clipboard!');
    setShowMenuModal(false);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    quotePost(post.id, quoteCaption.trim());
    setQuoteCaption('');
    setShowQuoteDialog(false);
  };

  // Original post attribution extraction if quoted or reposted
  const originalAuthor = post.quotePost
    ? (post.quotePost.authorUsername || post.quotePost.user?.username || '')
    : '';
  const originalName = post.quotePost
    ? (post.quotePost.authorName || post.quotePost.user?.name || '')
    : '';
  const originalAvatar = post.quotePost
    ? (post.quotePost.authorAvatar || post.quotePost.user?.avatar || '')
    : '';
  const originalVerified = post.quotePost
    ? Boolean(post.quotePost.isVerified || post.quotePost.user?.isVerified)
    : false;
  const originalCaption = post.quotePost
    ? (post.quotePost.caption || '')
    : '';
  const originalMedia = post.quotePost
    ? (post.quotePost.mediaUrl || (post.quotePost.mediaUrls && post.quotePost.mediaUrls[0]) || '')
    : '';
  const originalPostId = post.quotePost?.id || post.originalPostId;

  // Find circle name if restricted
  const audienceCircle = post.audienceCircleId
    ? customCircles.find(c => c.id === post.audienceCircleId)
    : null;

  const isLongCaption = post.caption.length > 95;

  return (
    <article
      id={`post-card-${post.id}`}
      className="w-full max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-6 overflow-hidden shadow-sm flex flex-col mx-auto ambient-glow transition-all"
    >
      {/* Repost or Quote attribution banner */}
      {(post.quotePost || post.repostedBy || post.isReposted) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-850/90">
          <div className="flex items-center gap-1.5 min-w-0">
            <Repeat className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {post.caption
                ? `${post.user.username} quote posted`
                : `${post.user.username} reposted`}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {post.caption ? 'Quote' : 'Repost'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => openUserProfile(post.user.id)}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 p-[1.5px] shrink-0 transition-transform group-hover:scale-105">
            <img
              src={post.user.avatar}
              alt={post.user.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:underline">
                {post.user.username}
              </span>
              {post.user.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 fill-indigo-500 text-white" />
              )}
              {/* Audience Restriction Badge */}
              {post.audience === 'close_friends' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Close Friends
                </span>
              )}
              {post.audience === 'custom_circle' && audienceCircle && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-0.5">
                  {audienceCircle.icon} {audienceCircle.name}
                </span>
              )}
              {post.isScheduled && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Scheduled
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400">
              {post.location ? (
                <span className="truncate max-w-[180px]">{post.location}</span>
              ) : (
                <span>{post.timestamp}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Why am I seeing this quick button */}
          <button
            onClick={() => setShowWhyModal(true)}
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Why am I seeing this?"
            aria-label="Why am I seeing this?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMenuModal(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Text Post Body OR Media / Video / Carousel Container */}
      {post.isTextPost || (post.mediaUrls.length === 0 && !post.videoUrl) ? (
        <div
          onClick={handleMediaClick}
          className="px-5 py-4 sm:px-6 sm:py-5 border-y border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
        >
          <div className="text-base sm:text-lg text-slate-900 dark:text-slate-100 font-normal leading-relaxed whitespace-pre-line break-words">
            <FormattedText text={post.caption} />
          </div>
        </div>
      ) : (
        <div
          className="relative w-full aspect-square bg-slate-100 dark:bg-slate-950 select-none overflow-hidden cursor-pointer"
          onClick={handleMediaClick}
        >
        {post.videoUrl ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={post.videoUrl}
              poster={post.mediaUrls[0]}
              playsInline
              loop
              muted={isVideoMuted}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              className="w-full h-full object-contain"
              onClick={toggleVideoPlay}
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoMuted(!isVideoMuted);
                }}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
              >
                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Play overlay button if paused */}
            {!isVideoPlaying && (
              <div
                onClick={toggleVideoPlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
              >
                <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                  <Play className="w-5 h-5 ml-0.5 fill-slate-900" />
                </div>
              </div>
            )}

            {/* Video Badge */}
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs font-mono z-10">
              <Video className="w-3 h-3 text-red-400" />
              <span>Video</span>
            </div>
          </div>
        ) : (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-slate-150 dark:bg-slate-850 animate-shimmer flex items-center justify-center z-5">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            )}
            <img
              src={post.mediaUrls[currentMediaIndex]}
              alt={`Post by ${post.user.username}`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
              className={`w-full h-full object-cover transition-[transform,opacity] duration-300 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              } ${post.filterClass || 'filter-normal'}`}
              loading="lazy"
            />

            {/* Text Post Badge */}
            {post.isTextPost && (
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs font-semibold z-10">
                <FileText className="w-3 h-3 text-indigo-400" />
                <span>Text Post</span>
              </div>
            )}
          </>
        )}

        {/* Double tap heart animation overlay */}
        <AnimatePresence>
          {showHeartAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.9] }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 fill-white text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media count badge in High Density aesthetic */}
        {post.mediaUrls.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/40 text-white text-[10px] px-2 py-1 rounded backdrop-blur-xs font-mono">
            {currentMediaIndex + 1}/{post.mediaUrls.length}
          </div>
        )}

        {/* Carousel arrows */}
        {post.mediaUrls.length > 1 && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={handlePrevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs z-10 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {currentMediaIndex < post.mediaUrls.length - 1 && (
              <button
                onClick={handleNextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs z-10 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10">
              {post.mediaUrls.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentMediaIndex ? 'bg-indigo-500 scale-125' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      )}

      {/* Action Buttons & Content */}
      <div className="p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            {/* Like button with long-press for reaction bar or click to like */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={startHeartHold}
                onMouseUp={cancelHeartHold}
                onMouseLeave={cancelHeartHold}
                onTouchStart={startHeartHold}
                onTouchEnd={cancelHeartHold}
                onClick={handleHeartClick}
                onContextMenu={e => {
                  e.preventDefault();
                  setShowReactionPicker(prev => !prev);
                }}
                className={`p-0.5 transition-transform active:scale-125 select-none relative ${
                  isHoldingHeart ? 'scale-115' : ''
                }`}
                aria-label={post.isLiked ? 'Unlike' : 'Like'}
                title="Click to like, press & hold for reactions"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    post.isLiked
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-800 dark:text-slate-200 stroke-[1.8px] hover:text-slate-500'
                  } ${isHoldingHeart ? 'text-rose-400 animate-pulse' : ''}`}
                />
              </button>

              {/* Expressive Reactions Picker Popup */}
              {showReactionPicker && (
                <div className="absolute bottom-full mb-2 left-0 flex items-center gap-1.5 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-30 animate-in fade-in zoom-in-95">
                  {availableEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        reactToPost(post.id, emoji);
                        setShowReactionPicker(false);
                      }}
                      className="text-lg hover:scale-130 transition-transform p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* Plus button to open full EmojiPickerModal */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowReactionPicker(false);
                      setShowFullEmojiPicker(true);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-all font-bold"
                    title="Pick any reaction emoji"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPostForModal(post)}
              className="p-0.5 text-slate-800 dark:text-slate-200 stroke-[1.8px] hover:text-slate-500 transition-colors"
              aria-label="Comment"
            >
              <MessageCircle className="w-5 h-5 stroke-[1.8px]" />
            </button>

            {/* Quote / Repost button */}
            <button
              onClick={() => setShowQuoteDialog(true)}
              className="p-0.5 text-slate-800 dark:text-slate-200 stroke-[1.8px] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-label="Quote or repost"
              title="Quote or repost post"
            >
              <Repeat className="w-4 h-4 stroke-[1.8px]" />
            </button>

            {/* Share Post Button (Replaces previous direct message trigger) */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-0.5 text-slate-800 dark:text-slate-200 stroke-[1.8px] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-label="Share post"
              title="Share post"
            >
              <Share2 className="w-5 h-5 stroke-[1.8px]" />
            </button>
          </div>

          <button
            onClick={() => toggleSavePost(post.id)}
            className="p-0.5 text-slate-800 dark:text-slate-200 stroke-[1.8px] hover:text-slate-500 transition-colors"
            aria-label={post.isSaved ? 'Remove from saved' : 'Save post'}
          >
            <Bookmark
              className={`w-5 h-5 ${
                post.isSaved ? 'fill-slate-900 dark:fill-white text-slate-900 dark:text-white' : ''
              }`}
            />
          </button>
        </div>

        {/* Aggregated Expressive Reactions Display */}
        {post.reactions && Object.keys(post.reactions).length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {Object.entries(post.reactions).map(([emoji, uids]) => {
              const isKitchenBlend = emoji.startsWith('[kitchen:');
              const blend = isKitchenBlend ? getBlendById(emoji.slice(9, -1)) : null;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => reactToPost(post.id, emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all cursor-pointer ${
                    post.userReaction === emoji
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title={blend ? `${blend.name} (${blend.emoji1} + ${blend.emoji2})` : emoji}
                >
                  {blend ? (
                    <img
                      src={blend.assetUrl}
                      alt={blend.name}
                      className="w-4 h-4 object-contain inline-block select-none"
                    />
                  ) : (
                    <span>{emoji}</span>
                  )}
                  <span className="text-[10px] font-mono">
                    {Array.isArray(uids) ? uids.length : 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Total Reactions Count (3s long press opens top 5 reactions modal) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={startCountHold}
            onMouseUp={cancelCountHold}
            onMouseLeave={cancelCountHold}
            onTouchStart={startCountHold}
            onTouchEnd={cancelCountHold}
            onClick={handleCountClick}
            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer select-none text-left"
            title="Click or press & hold for 3s to view top 5 reactions"
          >
            {totalReactionsCount.toLocaleString()} {totalReactionsCount === 1 ? 'reaction' : 'reactions'}
          </button>
          {isHoldingCount && (
            <span className="text-[10px] text-indigo-500 font-semibold animate-pulse">
              Opening top 5...
            </span>
          )}
        </div>

        {/* Caption & Original Post Attribution */}
        {post.quotePost && !post.caption ? (
          /* Quoted / Reposted WITHOUT a quote */
          <div className="space-y-2">
            {/* Clear Attribution Box */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
              <div
                className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
                onClick={() => {
                  const origUser = allUsers.find(u => u.username === originalAuthor);
                  if (origUser) openUserProfile(origUser.id);
                }}
              >
                {originalAvatar && (
                  <img
                    src={originalAvatar}
                    alt={originalAuthor}
                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-indigo-500/40"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white group-hover:underline">
                    <span className="truncate">Original Post by @{originalAuthor}</span>
                    {originalVerified && <CheckCircle2 className="w-3 h-3 fill-indigo-500 text-white shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {originalName ? `${originalName} · ` : ''}Original creator
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white shrink-0">
                Original
              </span>
            </div>

            {originalCaption && (
              <div className="text-sm leading-snug text-slate-900 dark:text-slate-100">
                <span className="font-bold mr-2 text-slate-900 dark:text-slate-100">
                  {originalAuthor}
                </span>
                <span>{originalCaption}</span>
              </div>
            )}
          </div>
        ) : post.quotePost && post.caption ? (
          /* Quoted WITH user commentary */
          <div className="space-y-2.5">
            {/* User commentary */}
            <div className="text-sm leading-snug text-slate-900 dark:text-slate-100">
              <span className="font-bold mr-2 text-slate-900 dark:text-slate-100">
                {post.user.username}
              </span>
              <span>
                {isLongCaption && !isCaptionExpanded ? `${post.caption.slice(0, 95)}... ` : post.caption}
              </span>
              {isLongCaption && !isCaptionExpanded && (
                <button
                  onClick={() => setIsCaptionExpanded(true)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-medium inline ml-1"
                >
                  more
                </button>
              )}
            </div>

            {/* Embedded Quoted Original Post Box */}
            <div
              onClick={() => {
                if (originalPostId) {
                  const orig = posts.find(p => p.id === originalPostId);
                  if (orig) setSelectedPostForModal(orig);
                }
              }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 hover:border-indigo-400/50 ambient-glow transition-all cursor-pointer space-y-2 select-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {originalAvatar && (
                    <img src={originalAvatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                  )}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
                    <span>@{originalAuthor}</span>
                    {originalVerified && <CheckCircle2 className="w-3 h-3 fill-indigo-500 text-white shrink-0" />}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  Original Post
                </span>
              </div>
              {originalCaption && (
                <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  <FormattedText text={originalCaption} />
                </div>
              )}
              {originalMedia && (
                <div className="rounded-xl overflow-hidden aspect-video max-h-40 bg-black/5">
                  <img src={originalMedia} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        ) : !post.isTextPost ? (
          /* Standard Media Post Caption */
          <div className="text-sm leading-snug text-slate-900 dark:text-slate-100">
            <span className="font-bold mr-2 text-slate-900 dark:text-slate-100">
              {post.user.username}
            </span>
            <span>
              <FormattedText
                text={isLongCaption && !isCaptionExpanded ? `${post.caption.slice(0, 95)}... ` : post.caption}
              />
            </span>
            {isLongCaption && !isCaptionExpanded && (
              <button
                onClick={() => setIsCaptionExpanded(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-medium inline ml-1"
              >
                more
              </button>
            )}
          </div>
        ) : null}

        {/* View all comments link */}
        {post.comments.length > 0 && (
          <button
            onClick={() => setSelectedPostForModal(post)}
            className="text-xs text-slate-400 uppercase tracking-tight font-medium hover:text-slate-600 dark:hover:text-slate-300 block text-left"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Recent comment snippet */}
        {post.comments.length > 0 && (
          <div className="text-xs text-slate-700 dark:text-slate-300 truncate flex items-center gap-1">
            <span className="font-bold mr-1 text-slate-900 dark:text-slate-100 shrink-0">
              {post.comments[post.comments.length - 1].user.username}
            </span>
            <span className="truncate">
              <FormattedText text={post.comments[post.comments.length - 1].text} />
            </span>
          </div>
        )}

        {/* Real-time Emoji Kitchen blend suggestion for comment */}
        {(() => {
          const detected = detectEmojiBlendInText(commentText);
          if (detected && dismissedCommentBlendKey !== `${detected.blend.id}_${detected.match}`) {
            return (
              <div className="pt-1">
                <EmojiBlendSuggestionBanner
                  blend={detected.blend}
                  onApplyBlend={blend => {
                    const token = formatBlendToken(blend);
                    setCommentText(prev => prev.replace(detected.match, `${token} `));
                  }}
                  onOpenKitchen={() => setShowCommentKitchenModal(true)}
                  onDismiss={() => {
                    setDismissedCommentBlendKey(`${detected.blend.id}_${detected.match}`);
                  }}
                />
              </div>
            );
          }
          return null;
        })()}

        {/* Inline Comment Form */}
        <form
          onSubmit={handleAddComment}
          className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 relative"
        >
          <div className="flex items-center space-x-1.5 flex-1 mr-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowCommentKitchenModal(true)}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-md text-xs"
              title="Emoji Kitchen Lab"
              aria-label="Emoji Kitchen"
            >
              🧪
            </button>

            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={t('post.addComment')}
              className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!commentText.trim()}
            className={`text-sm font-bold transition-colors ${
              commentText.trim()
                ? 'text-indigo-500 hover:text-indigo-700 cursor-pointer'
                : 'text-slate-300 dark:text-slate-600 cursor-default'
            }`}
          >
            {t('post.postComment')}
          </button>

          {/* Quick emoji drawer */}
          {showEmojiPicker && (
            <div className="absolute -top-12 left-0 flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 z-30">
              {['❤️', '🔥', '🙌', '😍', '👏', '✨'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="hover:scale-125 transition-transform text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Quote Post Dialog */}
      {showQuoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleQuoteSubmit}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-indigo-500" />
                Quote Post
              </span>
              <button
                type="button"
                onClick={() => setShowQuoteDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={quoteCaption}
              onChange={e => setQuoteCaption(e.target.value)}
              placeholder="Add your commentary (optional — leave empty to repost without quote)..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              autoFocus
            />

            {/* Quoted Preview */}
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center gap-2 text-xs">
              <img
                src={post.mediaUrls[0]}
                alt=""
                className="w-10 h-10 rounded-md object-cover shrink-0"
              />
              <div className="truncate">
                <div className="font-bold text-slate-900 dark:text-white">@{post.user.username}</div>
                <div className="text-slate-400 truncate">{post.caption || 'Original post content'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQuoteDialog(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {quoteCaption.trim() ? 'Share Quote' : 'Post Without Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3-Dots Options Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-900 dark:text-white text-center animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-800">
            {isOwnPost && (
              <>
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    setShowEmojiSettingsModal(true);
                  }}
                  className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400"
                >
                  <Sliders className="w-4 h-4" />
                  Emoji Reaction Settings
                </button>
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    setConfirmModal({
                      isOpen: true,
                      title: 'Archive Post',
                      message: 'Are you sure you want to archive this post? It will be moved to your archive in settings.',
                      variant: 'warning',
                      action: () => archivePost(post.id)
                    });
                  }}
                  className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400"
                >
                  <Archive className="w-4 h-4" />
                  Archive Post
                </button>
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    setConfirmModal({
                      isOpen: true,
                      title: 'Delete Post',
                      message: 'Are you sure you want to delete this post? This action will permanently remove it.',
                      variant: 'danger',
                      action: () => deletePost(post.id)
                    });
                  }}
                  className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowMenuModal(false);
                setShowWhyModal(true);
              }}
              className="w-full py-3.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Why am I seeing this?
            </button>
            <button
              onClick={() => {
                setShowMenuModal(false);
                openUserProfile(post.user.id);
              }}
              className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              View Profile (@{post.user.username})
            </button>
            <button
              onClick={() => {
                setShowMenuModal(false);
                setShowQuoteDialog(true);
              }}
              className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Quote Post
            </button>
            {!isOwnPost && (
              <>
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    startConversationWithUser(post.user);
                  }}
                  className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  Send Direct Message
                </button>
                <button
                  onClick={() => {
                    toggleFollowUser(post.user.id);
                    setShowMenuModal(false);
                  }}
                  className={`w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    isFollowingAuthor
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {isFollowingAuthor
                    ? `Unfollow @${post.user.username}`
                    : `Follow @${post.user.username}`}
                </button>
              </>
            )}
            <button
              onClick={() => {
                toggleSavePost(post.id);
                setShowMenuModal(false);
              }}
              className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              {post.isSaved ? 'Remove from collection' : 'Save post'}
            </button>
            <button
              onClick={copyPostLink}
              className="w-full py-3.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Copy link
            </button>
            {!isOwnPost && (
              <>
                <button
                  id={`post-report-btn-${post.id}`}
                  onClick={() => {
                    setShowMenuModal(false);
                    setShowReportModal(true);
                  }}
                  className="w-full py-3.5 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  Report Post
                </button>
                <button
                  id={`post-block-user-btn-${post.id}`}
                  onClick={() => {
                    setShowMenuModal(false);
                    setConfirmModal({
                      isOpen: true,
                      title: `Block @${post.user.username}?`,
                      message: `Are you sure you want to block @${post.user.username}? You won't see their posts or profile, and they won't be able to interact with you.`,
                      variant: 'danger',
                      action: () => blockUser(post.user.id)
                    });
                  }}
                  className="w-full py-3.5 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Block @{post.user.username}
                </button>
              </>
            )}
            <button
              onClick={() => setShowMenuModal(false)}
              className="w-full py-3.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report Post Modal */}
      <ReportPostModal
        isOpen={showReportModal}
        postId={post.id}
        authorUsername={post.user.username}
        onClose={() => setShowReportModal(false)}
      />

      {/* Why Am I Seeing This Modal */}
      <WhyAmISeeingThisModal
        post={post}
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
      />

      {/* Top 5 Reactions Modal */}
      {showTopReactionsModal && (
        <PostReactionsModal
          post={post}
          onClose={() => setShowTopReactionsModal(false)}
        />
      )}

      {/* Creator Emoji Restrictions Modal */}
      <PostEmojiSettingsModal
        isOpen={showEmojiSettingsModal}
        initialAllowed={post.allowedEmojis}
        initialRestricted={post.restrictedEmojis}
        onSave={(allowed, restricted) => {
          updatePostEmojiSettings(post.id, allowed, restricted);
        }}
        onClose={() => setShowEmojiSettingsModal(false)}
      />

      {/* Confirmation Modal for Delete / Archive */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={() => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          confirmModal.action();
        }}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Share Post Modal */}
      {showShareModal && (
        <SharePostModal
          isOpen={showShareModal}
          post={post}
          onClose={() => setShowShareModal(false)}
          onOpenQuote={() => {
            setShowShareModal(false);
            setShowQuoteDialog(true);
          }}
        />
      )}

      {/* Full Emoji Picker Modal */}
      {showFullEmojiPicker && (
        <EmojiPickerModal
          isOpen={showFullEmojiPicker}
          allowedEmojis={post.allowedEmojis}
          onSelectEmoji={emoji => reactToPost(post.id, emoji)}
          onSelectBlend={blend => {
            reactToPost(post.id, formatBlendToken(blend));
            setShowFullEmojiPicker(false);
          }}
          onClose={() => setShowFullEmojiPicker(false)}
          title={`React to @${post.user.username}'s Post`}
        />
      )}

      {/* Comment Emoji Kitchen Modal */}
      {showCommentKitchenModal && (
        <EmojiKitchenModal
          isOpen={showCommentKitchenModal}
          onClose={() => setShowCommentKitchenModal(false)}
          onSelectBlend={blend => {
            const token = formatBlendToken(blend);
            setCommentText(prev => (prev ? `${prev} ${token}` : token));
            setShowCommentKitchenModal(false);
          }}
          insertButtonLabel="Add to Comment"
        />
      )}
    </article>
  );
};

