// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
  Repeat,
  Sparkles,
  ExternalLink,
  Users
} from 'lucide-react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';

interface SharePostModalProps {
  isOpen: boolean;
  post: Post | null;
  onClose: () => void;
  onOpenQuote?: () => void;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  isOpen,
  post,
  onClose,
  onOpenQuote
}) => {
  const {
    conversations,
    allUsers,
    currentUser,
    sendMessage,
    startConversationWithUser,
    showToast,
    createStory,
    repostPost
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageNote, setMessageNote] = useState('');
  const [sentUserIds, setSentUserIds] = useState<string[]>([]);

  if (!isOpen || !post) return null;

  const postUrl = `${window.location.origin}/#post-${post.id}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
      }
      setCopied(true);
      showToast('Post link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copied post link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.user.username} on Yaawp`,
          text: post.caption ? `${post.caption} — @${post.user.username}` : `Check out this post by @${post.user.username}`,
          url: postUrl
        });
        showToast('Shared successfully!');
        onClose();
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendToUser = (targetUserId: string) => {
    if (sentUserIds.includes(targetUserId)) return;

    // Find conversation or create one
    let targetConv = conversations.find(c => c.participant.id === targetUserId);
    if (!targetConv) {
      const user = allUsers.find(u => u.id === targetUserId);
      if (user) {
        startConversationWithUser(user);
        targetConv = conversations.find(c => c.participant.id === targetUserId);
      }
    }

    const shareText = messageNote.trim()
      ? `${messageNote.trim()}\n\n🔗 Shared post by @${post.user.username}: "${post.caption || 'Photo'}"\n${postUrl}`
      : `🔗 Shared post by @${post.user.username}: "${post.caption || 'Photo'}"\n${postUrl}`;

    if (targetConv) {
      sendMessage(targetConv.id, shareText);
    }

    setSentUserIds(prev => [...prev, targetUserId]);
    showToast(`Post sent to @${allUsers.find(u => u.id === targetUserId)?.username || 'user'}!`);
  };

  const handleShareToStory = () => {
    createStory({
      mediaUrl: post.mediaUrls[0],
      caption: `Shared from @${post.user.username}`
    });
    showToast('Post shared to your story!');
    onClose();
  };

  const handleQuickRepost = () => {
    repostPost(post.id);
    onClose();
  };

  // Recent contacts
  const contacts = allUsers
    .filter(u => u.id !== currentUser.id)
    .filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Share Post
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                by @{post.user.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Preview Miniature */}
        <div className="p-3 mx-4 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
          <img
            src={post.mediaUrls[0]}
            alt=""
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              @{post.user.username}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {post.caption || 'Shared photo'}
            </p>
          </div>
        </div>

        {/* Action Row */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-slate-100 dark:border-slate-800 text-center">
          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-105 transition-transform">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </button>

          {/* Share to Story */}
          <button
            type="button"
            onClick={handleShareToStory}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Add to Story
            </span>
          </button>

          {/* Repost / Quote */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenQuote) {
                onOpenQuote();
              } else {
                handleQuickRepost();
              }
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Quote Post
            </span>
          </button>

          {/* Native Share / Apps */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <ExternalLink className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Share via...
            </span>
          </button>
        </div>

        {/* Send in Direct Message Section */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
              Send in Direct Message
            </span>
            <span className="text-[11px] text-slate-400">
              {contacts.length} users
            </span>
          </div>

          {/* Optional Note input */}
          <input
            type="text"
            value={messageNote}
            onChange={e => setMessageNote(e.target.value)}
            placeholder="Write an optional message..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {/* Search contacts */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />

          {/* Contact List */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {contacts.map(user => {
              const isSent = sentUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendToUser(user.id)}
                    disabled={isSent}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                      isSent
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Sent</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
