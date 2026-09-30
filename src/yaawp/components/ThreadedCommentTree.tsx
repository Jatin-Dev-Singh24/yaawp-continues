// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { Heart, MessageSquare, ChevronDown, ChevronRight, CornerDownRight, Send, Trash2 } from 'lucide-react';
import { Comment, UserSummary } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { FormattedText } from './FormattedText';
import { EmojiKitchenModal } from './EmojiKitchenModal';
import { EmojiBlendSuggestionBanner } from './EmojiBlendSuggestionBanner';
import {
  detectEmojiBlendInText,
  formatBlendToken
} from '../data/emojiKitchen';

interface ThreadedCommentTreeProps {
  comments: Comment[];
  onAddReply?: (parentId: string, text: string) => void;
  onReply?: (parentId: string, text: string) => void;
  onLikeComment?: (commentId: string) => void;
  onOpenUserProfile?: (userId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId?: string;
  maxIndentLevel?: number;
}

export const ThreadedCommentTree: React.FC<ThreadedCommentTreeProps> = ({
  comments,
  onAddReply,
  onReply,
  onLikeComment,
  onOpenUserProfile,
  onDeleteComment,
  currentUserId,
  maxIndentLevel = 5
}) => {
  const replyHandler = onAddReply || onReply || (() => {});

  return (
    <div className="space-y-3.5 w-full">
      {comments.map(comment => (
        <CommentNode
          key={comment.id}
          comment={comment}
          depth={0}
          onAddReply={replyHandler}
          onLikeComment={onLikeComment}
          onOpenUserProfile={onOpenUserProfile}
          onDeleteComment={onDeleteComment}
          currentUserId={currentUserId}
          maxIndentLevel={maxIndentLevel}
        />
      ))}
    </div>
  );
};

interface CommentNodeProps {
  comment: Comment;
  depth: number;
  onAddReply?: (parentId: string, text: string) => void;
  onLikeComment?: (commentId: string) => void;
  onOpenUserProfile?: (userId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId?: string;
  maxIndentLevel: number;
}

const CommentNode: React.FC<CommentNodeProps> = ({
  comment,
  depth,
  onAddReply,
  onLikeComment,
  onOpenUserProfile,
  onDeleteComment,
  currentUserId,
  maxIndentLevel
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [dismissedBlendKey, setDismissedBlendKey] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const currentIndent = Math.min(depth, maxIndentLevel);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (typeof onAddReply === 'function') {
      onAddReply(comment.id, replyText.trim());
    }
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div
      className={`group relative text-xs ${
        depth > 0 ? 'ml-3 sm:ml-5 pl-2.5 sm:pl-3.5 border-l-2 border-slate-200 dark:border-slate-800' : ''
      }`}
    >
      <div className="flex items-start gap-2.5 py-1">
        {/* Avatar */}
        <img
          src={comment.user.avatar}
          alt={comment.user.username}
          onClick={() => onOpenUserProfile?.(comment.user.id)}
          className="w-6 h-6 rounded-full object-cover shrink-0 cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700 hover:opacity-85 transition-opacity"
        />

        {/* Body */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header info */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              onClick={() => onOpenUserProfile?.(comment.user.id)}
              className="font-bold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer"
            >
              {comment.user.username}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              • {comment.timestamp}
            </span>

            {/* Collapse toggle (Reddit style) */}
            {hasReplies && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5 ml-1 px-1 py-0.2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
              >
                {isCollapsed ? (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>+{comment.replies?.length} replies</span>
                  </>
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {!isCollapsed && (
            <>
              {/* Comment text */}
              <div className="text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                <FormattedText text={comment.text} />
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {/* Like button */}
                <button
                  type="button"
                  onClick={() => onLikeComment?.(comment.id)}
                  className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${
                    comment.isLiked ? 'text-rose-500 font-semibold' : ''
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{comment.likesCount > 0 ? comment.likesCount : ''}</span>
                </button>

                {/* Reply button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(!isReplying);
                    if (!isReplying) {
                      setReplyText(`@${comment.user.username} `);
                    }
                  }}
                  className="flex items-center gap-1 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Reply</span>
                </button>

                {/* Delete button (only for comment author) */}
                {onDeleteComment && currentUserId === comment.user.id && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 font-medium text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              {/* Delete Confirmation Modal */}
              <ConfirmationModal
                isOpen={showDeleteConfirm}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={() => {
                  setShowDeleteConfirm(false);
                  onDeleteComment?.(comment.id);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
              />

              {/* Inlined Reply Composer */}
              {isReplying && (
                <div className="mt-2 space-y-1.5">
                  {/* Emoji Blend Suggestion Banner */}
                  {(() => {
                    const detected = detectEmojiBlendInText(replyText);
                    if (detected && dismissedBlendKey !== `${detected.blend.id}_${detected.match}`) {
                      return (
                        <EmojiBlendSuggestionBanner
                          blend={detected.blend}
                          onApplyBlend={blend => {
                            const token = formatBlendToken(blend);
                            setReplyText(prev => prev.replace(detected.match, `${token} `));
                          }}
                          onOpenKitchen={() => setIsKitchenOpen(true)}
                          onDismiss={() => {
                            setDismissedBlendKey(`${detected.blend.id}_${detected.match}`);
                          }}
                        />
                      );
                    }
                    return null;
                  })()}

                  <form
                    onSubmit={handleSubmitReply}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-in fade-in"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1" />

                    <button
                      type="button"
                      onClick={() => setIsKitchenOpen(true)}
                      className="p-1 rounded-md text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Emoji Kitchen Lab"
                      aria-label="Emoji Kitchen"
                    >
                      🧪
                    </button>

                    <input
                      type="text"
                      autoFocus
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to @${comment.user.username}...`}
                      className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-[11px] disabled:opacity-40 hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReplying(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1"
                    >
                      Cancel
                    </button>
                  </form>

                  {/* Emoji Kitchen Modal for reply */}
                  {isKitchenOpen && (
                    <EmojiKitchenModal
                      isOpen={isKitchenOpen}
                      onClose={() => setIsKitchenOpen(false)}
                      onSelectBlend={(blend) => {
                        const token = formatBlendToken(blend);
                        setReplyText(prev => (prev ? `${prev} ${token}` : token));
                        setIsKitchenOpen(false);
                      }}
                      insertButtonLabel="Add to Reply"
                    />
                  )}
                </div>
              )}

              {/* Nested Replies */}
              {hasReplies && (
                <div className="mt-2 space-y-2">
                  {comment.replies!.map(reply => (
                    <CommentNode
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      onAddReply={onAddReply}
                      onLikeComment={onLikeComment}
                      onOpenUserProfile={onOpenUserProfile}
                      onDeleteComment={onDeleteComment}
                      currentUserId={currentUserId}
                      maxIndentLevel={maxIndentLevel}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
