import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Heart, Send, Pause, Play, ChevronLeft, ChevronRight, Archive, Trash2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ConfirmationModal } from './ConfirmationModal';
import { ThreadedCommentTree } from './ThreadedCommentTree';
import { StoryPollComponent } from './story/StoryPollComponent';

export const StoryViewerModal: React.FC = () => {
  const {
    stories,
    activeStoryUserIndex,
    setActiveStoryUserIndex,
    sendMessage,
    showToast,
    conversations,
    currentUser,
    archiveStory,
    deleteStory,
    addStoryComment,
    likeStoryComment,
    deleteStoryComment,
    openUserProfile,
    voteStoryPoll
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [storyCommentText, setStoryCommentText] = useState('');
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

  const STORY_DURATION_MS = 5000;
  const currentStory = activeStoryUserIndex !== null ? stories[activeStoryUserIndex] : null;

  const handleNextStory = useCallback(() => {
    setActiveStoryUserIndex(prev => {
      if (prev === null) return null;
      if (prev < stories.length - 1) {
        return prev + 1;
      }
      return null;
    });
  }, [stories.length, setActiveStoryUserIndex]);

  const handlePrevStory = useCallback(() => {
    setActiveStoryUserIndex(prev => {
      if (prev === null || prev <= 0) return 0;
      return prev - 1;
    });
  }, [setActiveStoryUserIndex]);

  // Auto-progress timer
  useEffect(() => {
    if (activeStoryUserIndex === null || !currentStory || isPaused || showCommentsDrawer || confirmModal.isOpen) return;

    const interval = 50; // update every 50ms
    const step = (interval / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        return next >= 100 ? 100 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryUserIndex, isPaused, showCommentsDrawer, confirmModal.isOpen, currentStory]);

  // Advance story safely when progress hits 100%
  useEffect(() => {
    if (progress >= 100) {
      setProgress(0);
      handleNextStory();
    }
  }, [progress, handleNextStory]);

  // Reset progress on story change
  useEffect(() => {
    setProgress(0);
  }, [activeStoryUserIndex]);

  // Keyboard navigation & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveStoryUserIndex(null);
      if (e.key === 'ArrowRight') handleNextStory();
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === ' ') setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryUserIndex, handleNextStory, handlePrevStory, setActiveStoryUserIndex]);

  if (activeStoryUserIndex === null || !currentStory) return null;

  const triggerReaction = (emoji: string) => {
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 1200);

    // Also send reaction to DM if conversation exists
    const conv = conversations.find(c => c.participant.username === currentStory.user.username);
    if (conv) {
      sendMessage(conv.id, `Reacted ${emoji} to your story`);
    }
    showToast(`Reacted ${emoji}`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const conv = conversations.find(c => c.participant.username === currentStory.user.username);
    if (conv) {
      sendMessage(conv.id, `Replying to story: "${replyText.trim()}"`);
    }
    showToast(`Sent reply to ${currentStory.user.username}`);
    setReplyText('');
  };

  return (
    <div
      id="story-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
    >
      {/* Navigation Arrows (Desktop) */}
      {activeStoryUserIndex > 0 && (
        <button
          onClick={handlePrevStory}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {activeStoryUserIndex < stories.length - 1 && (
        <button
          onClick={handleNextStory}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Story Container */}
      <div
        className="relative w-full max-w-[420px] h-full max-h-[860px] md:h-[90vh] md:rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => {
          if (!showCommentsDrawer && !confirmModal.isOpen) setIsPaused(false);
        }}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          if (!showCommentsDrawer && !confirmModal.isOpen) setIsPaused(false);
        }}
      >
        {/* Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {stories.map((s, idx) => {
            let width = '0%';
            if (idx < activeStoryUserIndex) width = '100%';
            else if (idx === activeStoryUserIndex) width = `${progress}%`;

            return (
              <div
                key={s.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all ease-linear"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Header */}
        <div className="absolute top-7 inset-x-3 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.user.avatar}
              alt={currentStory.user.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{currentStory.user.username}</span>
              <span className="text-xs text-white/70">{currentStory.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm border border-white/15">
            {/* Toggle Comments Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                setShowCommentsDrawer(prev => !prev);
                setIsPaused(true);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              title="Story comments & discussion"
              aria-label="Story comments"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {currentStory.user.id === currentUser.id && (
              <>
                {/* Archive Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsPaused(true);
                    setConfirmModal({
                      isOpen: true,
                      title: 'Archive Story',
                      message: 'Are you sure you want to archive this story? It will be moved to your story archive.',
                      variant: 'warning',
                      action: () => {
                        archiveStory(currentStory.id);
                        setActiveStoryUserIndex(null);
                        showToast('Story archived');
                      }
                    });
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-white/80 hover:text-amber-300 transition-colors"
                  title="Archive Story"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsPaused(true);
                    setConfirmModal({
                      isOpen: true,
                      title: 'Delete Story',
                      message: 'Are you sure you want to delete this story? This action cannot be undone.',
                      variant: 'danger',
                      action: () => {
                        deleteStory(currentStory.id);
                        setActiveStoryUserIndex(null);
                        showToast('Story deleted');
                      }
                    });
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-white/80 hover:text-rose-400 transition-colors"
                  title="Delete Story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Subtle separator */}
            <div className="w-px h-4 bg-white/20 mx-0.5" />

            {/* Pause / Resume Button with distinct hit area */}
            <button
              onClick={e => {
                e.stopPropagation();
                setIsPaused(p => !p);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isPaused
                  ? 'bg-amber-500/80 text-white hover:bg-amber-500'
                  : 'hover:bg-white/20 text-white/90 hover:text-white'
              }`}
              aria-label={isPaused ? 'Resume story' : 'Pause story'}
              title={isPaused ? 'Resume story (Space)' : 'Pause story (Space)'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-white ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Subtle separator */}
            <div className="w-px h-4 bg-white/20 mx-0.5" />

            {/* Single Close (X) button with distinct spacing */}
            <button
              onClick={e => {
                e.stopPropagation();
                setActiveStoryUserIndex(null);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-rose-500/80 text-white/90 hover:text-white transition-colors"
              aria-label="Close story"
              title="Close story (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tap areas for mobile / quick click */}
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              handlePrevStory();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              handleNextStory();
            }}
          />
        </div>

        {/* Story Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="w-full h-full object-cover select-none"
          />

          {/* Floating Emoji animations */}
          <AnimatePresence>
            {floatingEmojis.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, y: 50, scale: 0.8 }}
                animate={{ opacity: 0, y: -250, scale: 1.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute bottom-24 right-8 text-4xl pointer-events-none z-30"
              >
                {item.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Interactive Story Poll */}
          {currentStory.poll && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-35 flex justify-center pointer-events-auto">
              <StoryPollComponent
                poll={currentStory.poll}
                storyId={currentStory.id}
                onVote={(optionId) => {
                  voteStoryPoll(currentStory.id, optionId);
                  showToast('Vote counted!');
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 3500);
                }}
                onPause={() => setIsPaused(true)}
                onResume={() => setIsPaused(false)}
              />
            </div>
          )}

          {/* Story Caption */}
          {currentStory.caption && (
            <div className={`absolute inset-x-4 z-30 bg-black/50 backdrop-blur-xs p-3 rounded-xl text-white text-sm text-center ${
              currentStory.poll ? 'bottom-16' : 'bottom-24'
            }`}>
              {currentStory.caption}
            </div>
          )}
        </div>

        {/* Bottom Reply Bar & Quick Emojis */}
        <div
          className="relative z-30 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2"
          onClick={e => e.stopPropagation()}
        >
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.user.username}...`}
              className="flex-1 bg-white/20 hover:bg-white/25 focus:bg-white/30 text-white placeholder-white/70 text-sm px-4 py-2 rounded-full border border-white/30 focus:outline-none transition-colors"
            />
            {replyText.trim() ? (
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
                aria-label="Send reply"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => triggerReaction('❤️')}
                className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Like story"
              >
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </button>
            )}
          </form>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-around px-2 pt-1">
            {['❤️', '🔥', '😂', '👏', '😮', '😍'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => triggerReaction(emoji)}
                className="text-xl hover:scale-130 active:scale-95 transition-transform"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Story Threaded Comments Drawer */}
        <AnimatePresence>
          {showCommentsDrawer && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 top-16 z-40 bg-white dark:bg-slate-900 rounded-t-3xl p-4 flex flex-col shadow-2xl text-slate-900 dark:text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                  Story Conversation
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentsDrawer(false);
                    setIsPaused(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2">
                {currentStory.comments && currentStory.comments.length > 0 ? (
                  <ThreadedCommentTree
                    comments={currentStory.comments}
                    onAddReply={(parentId, text) => {
                      addStoryComment(currentStory.id, text, parentId);
                      showToast('Reply posted');
                    }}
                    onLikeComment={(commentId) => likeStoryComment(currentStory.id, commentId)}
                    onDeleteComment={(commentId) => deleteStoryComment(currentStory.id, commentId)}
                    onOpenUserProfile={userId => {
                      setActiveStoryUserIndex(null);
                      openUserProfile(userId);
                    }}
                    currentUserId={currentUser.id}
                  />
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No comments yet. Join the conversation!
                  </div>
                )}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!storyCommentText.trim()) return;
                  addStoryComment(currentStory.id, storyCommentText.trim());
                  setStoryCommentText('');
                  showToast('Comment posted');
                }}
                className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={storyCommentText}
                  onChange={e => setStoryCommentText(e.target.value)}
                  placeholder="Join the conversation..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!storyCommentText.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Story Confirmation Modal for Delete/Archive */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={() => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setIsPaused(false);
          confirmModal.action();
        }}
        onCancel={() => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setIsPaused(false);
        }}
      />
    </div>
  );
};
