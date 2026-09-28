import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Repeat,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Smile,
  CheckCircle2,
  Edit2,
  Archive,
  EyeOff,
  Trash2,
  Copy,
  Check,
  Plus,
  Sliders,
  Flag,
  Ban,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThreadedCommentTree } from './ThreadedCommentTree';
import { ConfirmationModal } from './ConfirmationModal';
import { SharePostModal } from './SharePostModal';
import { EmojiPickerModal } from './EmojiPickerModal';
import { PostEmojiSettingsModal } from './PostEmojiSettingsModal';
import { ReportPostModal } from './ReportPostModal';
import { FormattedText } from './FormattedText';
import { EmojiKitchenModal } from './EmojiKitchenModal';
import { EmojiBlendSuggestionBanner } from './EmojiBlendSuggestionBanner';
import {
  detectEmojiBlendInText,
  formatBlendToken,
  getBlendById
} from '../data/emojiKitchen';
import { DEFAULT_QUICK_REACTIONS } from '../data/emojis';

export const PostDetailModal: React.FC = () => {
  const {
    selectedPostForModal,
    setSelectedPostForModal,
    toggleLikePost,
    toggleSavePost,
    addComment,
    likeComment,
    deleteComment,
    openUserProfile,
    showToast,
    currentUser,
    posts,
    allUsers,
    quotePost,
    editPost,
    deletePost,
    archivePost,
    toggleHidePostFromGrid,
    reactToPost,
    updatePostEmojiSettings,
    blockUser,
    toggleFollowUser,
    followedUserIds
  } = useApp();

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteCaption, setQuoteCaption] = useState('');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [showEmojiSettingsModal, setShowEmojiSettingsModal] = useState(false);
  const [showCommentFullEmojiPicker, setShowCommentFullEmojiPicker] = useState(false);
  const [showCommentKitchenModal, setShowCommentKitchenModal] = useState(false);
  const [dismissedCommentBlendKey, setDismissedCommentBlendKey] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: 'danger' | 'warning';
    confirmLabel: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    variant: 'danger',
    confirmLabel: 'Confirm'
  });

  if (!selectedPostForModal) return null;
  const post = selectedPostForModal;
  const isOwnPost =
    post.user.id === currentUser.id ||
    Boolean(
      post.user.username &&
      currentUser.username &&
      post.user.username.toLowerCase() === currentUser.username.toLowerCase()
    );

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

  // Calculate total reactions count
  const totalReactionsCount = useMemo(() => {
    if (!post.reactions || Object.keys(post.reactions).length === 0) {
      return post.likesCount || 0;
    }
    let count = 0;
    Object.values(post.reactions).forEach(uids => {
      count += Array.isArray(uids) ? uids.length : 1;
    });
    return Math.max(post.likesCount || 0, count);
  }, [post.reactions, post.likesCount]);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    quotePost(post.id, quoteCaption.trim());
    setQuoteCaption('');
    setShowQuoteDialog(false);
  };

  const handleNextMedia = () => {
    if (currentMediaIndex < post.mediaUrls.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const handlePrevMedia = () => {
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

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Post link copied to clipboard!');
  };

  const goToProfile = (userId: string) => {
    setSelectedPostForModal(null);
    openUserProfile(userId);
  };

  return (
    <div
      id="post-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 md:p-8"
      onClick={() => setSelectedPostForModal(null)}
    >
      {/* Close button */}
      <button
        onClick={() => setSelectedPostForModal(null)}
        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2"
        aria-label="Close detail modal"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Container */}
      <div
        className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 ambient-glow"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Media */}
        <div className="relative w-full md:w-3/5 bg-black flex items-center justify-center overflow-hidden">
          <img
            src={post.mediaUrls[currentMediaIndex]}
            alt="Post content"
            className={`max-w-full max-h-full object-contain ${post.filterClass || 'filter-normal'}`}
          />

          {/* Carousel arrows */}
          {post.mediaUrls.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {currentMediaIndex < post.mediaUrls.length - 1 && (
                <button
                  onClick={handleNextMedia}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {post.mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      idx === currentMediaIndex ? 'bg-indigo-500 scale-125' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Header, Comments, Actions */}
        <div className="w-full md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => goToProfile(post.user.id)}
            >
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-9 h-9 rounded-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:underline">
                    {post.user.username}
                  </span>
                  {post.user.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 fill-indigo-500 text-white" />
                  )}
                </div>
                {post.location && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {post.location}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Post options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showOptionsMenu && (
                <div className="absolute right-0 top-8 z-30 w-48 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 space-y-1 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in">
                  {isOwnPost ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditingCaption(true);
                          setEditedCaption(post.caption);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                        Edit Caption
                      </button>

                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowEmojiSettingsModal(true);
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                        Emoji Reaction Settings
                      </button>

                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setConfirmState({
                            isOpen: true,
                            title: 'Archive Post',
                            message: 'Are you sure you want to archive this post? You can restore it later from your profile settings archive.',
                            confirmLabel: 'Archive',
                            variant: 'warning',
                            action: () => {
                              archivePost(post.id);
                              setSelectedPostForModal(null);
                            }
                          });
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-500" />
                        Archive Post
                      </button>

                      <button
                        onClick={() => {
                          toggleHidePostFromGrid(post.id);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-purple-500" />
                        Hide from Profile
                      </button>

                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setConfirmState({
                            isOpen: true,
                            title: 'Delete Post',
                            message: 'Are you sure you want to delete this post? This will permanently delete your post and its comments.',
                            confirmLabel: 'Delete',
                            variant: 'danger',
                            action: () => {
                              deletePost(post.id);
                              setSelectedPostForModal(null);
                            }
                          });
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Post
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={() => {
                      copyLink();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Copy Link
                  </button>

                  {!isOwnPost && (
                    <>
                      <button
                        onClick={() => {
                          toggleFollowUser(post.user.id);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        {followedUserIds.includes(post.user.id) ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-rose-500" />
                            Unfollow @{post.user.username}
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                            Follow @{post.user.username}
                          </>
                        )}
                      </button>

                      <button
                        id="modal-report-post-btn"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowReportModal(true);
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report Post
                      </button>

                      <button
                        id="modal-block-user-btn"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setConfirmState({
                            isOpen: true,
                            title: `Block @${post.user.username}?`,
                            message: `Are you sure you want to block @${post.user.username}? You won't see their posts or profile.`,
                            confirmLabel: 'Block',
                            variant: 'danger',
                            action: () => {
                              blockUser(post.user.id);
                              setSelectedPostForModal(null);
                            }
                          });
                        }}
                        className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Block @{post.user.username}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments & Caption Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {/* Caption as first comment or inline editor */}
            {isEditingCaption ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <textarea
                  value={editedCaption}
                  onChange={e => setEditedCaption(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingCaption(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editedCaption.trim()) {
                        editPost(post.id, editedCaption);
                        setIsEditingCaption(false);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : post.quotePost && !post.caption ? (
              /* Quoted / Reposted WITHOUT user commentary */
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div
                    className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
                    onClick={() => {
                      const origUser = allUsers.find(u => u.username === originalAuthor);
                      if (origUser) goToProfile(origUser.id);
                    }}
                  >
                    {originalAvatar && (
                      <img
                        src={originalAvatar}
                        alt={originalAuthor}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-indigo-500/40"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white group-hover:underline">
                        <span className="truncate">Original Post by @{originalAuthor}</span>
                        {originalVerified && <CheckCircle2 className="w-3.5 h-3.5 fill-indigo-500 text-white shrink-0" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {originalName ? `${originalName} · ` : ''}Original creator
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white shrink-0">
                    Original
                  </span>
                </div>

                {originalCaption && (
                  <div className="text-slate-900 dark:text-slate-100 leading-snug">
                    <span
                      onClick={() => {
                        const origUser = allUsers.find(u => u.username === originalAuthor);
                        if (origUser) goToProfile(origUser.id);
                      }}
                      className="font-bold mr-1.5 cursor-pointer hover:underline"
                    >
                      {originalAuthor}
                    </span>
                    <span><FormattedText text={originalCaption} /></span>
                  </div>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                  Reposted by @{post.user.username} · {post.timestamp}
                </span>
              </div>
            ) : post.quotePost && post.caption ? (
              /* Quoted WITH user commentary */
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.username}
                    onClick={() => goToProfile(post.user.id)}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-slate-900 dark:text-slate-100 leading-snug">
                      <span
                        onClick={() => goToProfile(post.user.id)}
                        className="font-bold mr-1.5 cursor-pointer hover:underline"
                      >
                        {post.user.username}
                      </span>
                      <FormattedText text={post.caption} />
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {post.timestamp}
                    </span>
                  </div>
                </div>

                {/* Embedded Quoted Original Post Box */}
                <div
                  onClick={() => {
                    if (originalPostId) {
                      const orig = posts.find(p => p.id === originalPostId);
                      if (orig) setSelectedPostForModal(orig);
                    }
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 hover:border-indigo-400/60 transition-colors cursor-pointer space-y-2 select-none"
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
            ) : (
              /* Standard Post */
              <div className="flex items-start gap-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.username}
                  onClick={() => goToProfile(post.user.id)}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-slate-900 dark:text-slate-100 leading-snug">
                    <span
                      onClick={() => goToProfile(post.user.id)}
                      className="font-bold mr-1.5 cursor-pointer hover:underline"
                    >
                      {post.user.username}
                    </span>
                    <FormattedText text={post.caption} />
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                    {post.timestamp}
                  </span>
                </div>
              </div>
            )}

            {/* Threaded comments (Reddit style) */}
            {post.comments && post.comments.length > 0 ? (
              <ThreadedCommentTree
                comments={post.comments}
                onAddReply={(parentId, text) => addComment(post.id, text, parentId)}
                onLikeComment={(commentId) => likeComment(post.id, commentId)}
                onOpenUserProfile={(userId) => goToProfile(userId)}
                onDeleteComment={(commentId) => deleteComment(post.id, commentId)}
                currentUserId={currentUser.id}
              />
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <p className="text-xs">No comments yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Actions & Likes Count */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Heart / Reaction Button with Floating Picker */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
                >
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className="p-1 hover:scale-110 transition-transform"
                    title="Like or react to post"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        post.isLiked
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-slate-800 dark:text-slate-200 hover:text-slate-500'
                      }`}
                    />
                  </button>

                  {/* Floating Quick Reaction Bar */}
                  {showReactionPicker && (
                    <div className="absolute bottom-8 left-0 z-40 flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-850 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                      {((post.allowedEmojis && post.allowedEmojis.length > 0) ? post.allowedEmojis : DEFAULT_QUICK_REACTIONS).slice(0, 8).map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            reactToPost(post.id, emoji);
                            setShowReactionPicker(false);
                          }}
                          className="text-base hover:scale-130 transition-transform p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                      {/* Plus button to open full unrestricted EmojiPickerModal */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowReactionPicker(false);
                          setShowFullEmojiPicker(true);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-all font-bold"
                        title="Choose any reaction emoji"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowFullEmojiPicker(true)}
                  className="p-1 hover:scale-110 transition-transform text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="React with any emoji"
                >
                  <Smile className="w-5 h-5 stroke-[1.8px]" />
                </button>

                <button
                  onClick={() => commentInputRef.current?.focus()}
                  className="p-1 hover:scale-110 transition-transform"
                  title="Comment"
                >
                  <MessageCircle className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                </button>

                <button
                  onClick={() => setShowQuoteDialog(true)}
                  className="p-1 hover:scale-110 transition-transform text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Quote or repost"
                >
                  <Repeat className="w-4 h-4 stroke-[2]" />
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-1 hover:scale-110 transition-transform text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Share post"
                >
                  <Share2 className="w-5 h-5 stroke-[1.8px]" />
                </button>
              </div>

              <button
                onClick={() => toggleSavePost(post.id)}
                className="p-1 hover:scale-110 transition-transform"
                title="Save post"
              >
                <Bookmark
                  className={`w-5 h-5 ${
                    post.isSaved ? 'fill-slate-900 dark:fill-white text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                />
              </button>
            </div>

            {/* Aggregated Expressive Reaction Chips */}
            {post.reactions && Object.keys(post.reactions).length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
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

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {totalReactionsCount.toLocaleString()}{' '}
                {totalReactionsCount === 1
                  ? post.reactions && Object.keys(post.reactions).length > 0
                    ? 'reaction'
                    : 'like'
                  : post.reactions && Object.keys(post.reactions).length > 0
                  ? 'reactions'
                  : 'likes'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase mt-0.5">
                {post.timestamp}
              </span>
            </div>

            {/* Real-time Emoji Kitchen blend suggestion for modal comment */}
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

            {/* Comment input form */}
            <form
              onSubmit={handleAddComment}
              className="relative flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(prev => !prev)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                aria-label="Emojis"
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
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment... (mix emojis or stickers)"
                className="flex-1 text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              {commentText.trim() && (
                <button
                  type="submit"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                >
                  Post
                </button>
              )}

              {/* Emoji quick drawer */}
              {showEmojiPicker && (
                <div className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-30">
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
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(false);
                      setShowCommentFullEmojiPicker(true);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold"
                    title="More emojis..."
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Quote Dialog */}
      {showQuoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleQuoteSubmit}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Quote Post
              </span>
              <button
                type="button"
                onClick={() => setShowQuoteDialog(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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

      {/* Unrestricted Post Reaction Picker Modal */}
      {showFullEmojiPicker && (
        <EmojiPickerModal
          isOpen={showFullEmojiPicker}
          allowedEmojis={post.allowedEmojis}
          onSelectEmoji={(emoji) => {
            reactToPost(post.id, emoji);
            setShowFullEmojiPicker(false);
          }}
          onSelectBlend={(blend) => {
            reactToPost(post.id, formatBlendToken(blend));
            setShowFullEmojiPicker(false);
          }}
          onClose={() => setShowFullEmojiPicker(false)}
          title="React to this post"
        />
      )}

      {/* Comment Emoji Picker Modal (to insert any emoji into comment) */}
      {showCommentFullEmojiPicker && (
        <EmojiPickerModal
          isOpen={showCommentFullEmojiPicker}
          onSelectEmoji={(emoji) => {
            addEmoji(emoji);
            setShowCommentFullEmojiPicker(false);
          }}
          onSelectBlend={(blend) => {
            const token = formatBlendToken(blend);
            setCommentText(prev => (prev ? `${prev} ${token}` : token));
            setShowCommentFullEmojiPicker(false);
          }}
          onClose={() => setShowCommentFullEmojiPicker(false)}
          title="Insert Emoji or Kitchen Blend into Comment"
        />
      )}

      {/* Comment Emoji Kitchen Modal */}
      {showCommentKitchenModal && (
        <EmojiKitchenModal
          isOpen={showCommentKitchenModal}
          onClose={() => setShowCommentKitchenModal(false)}
          onSelectBlend={(blend) => {
            const token = formatBlendToken(blend);
            setCommentText(prev => (prev ? `${prev} ${token}` : token));
            setShowCommentKitchenModal(false);
          }}
          insertButtonLabel="Add to Comment"
        />
      )}

      {/* Post Owner Emoji Restriction Settings Modal */}
      {showEmojiSettingsModal && (
        <PostEmojiSettingsModal
          isOpen={showEmojiSettingsModal}
          initialAllowed={post.allowedEmojis}
          initialRestricted={post.restrictedEmojis}
          onSave={(allowed, restricted) => {
            updatePostEmojiSettings(post.id, allowed, restricted);
            setShowEmojiSettingsModal(false);
            showToast('Post emoji reaction settings updated');
          }}
          onClose={() => setShowEmojiSettingsModal(false)}
        />
      )}

      {/* Report Post Modal */}
      <ReportPostModal
        isOpen={showReportModal}
        postId={post.id}
        authorUsername={post.user.username}
        onClose={() => setShowReportModal(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={() => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          confirmState.action();
        }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
