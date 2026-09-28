import React, { useState } from 'react';
import {
  Shield,
  MoreVertical,
  ArrowLeft,
  MessageCircle,
  Clock,
  Grid,
  Bell,
  BellOff,
  Key,
  Lock,
  Eye,
  Sliders,
  Check,
  X,
  Heart,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatConversation } from '../../types';

interface HiddenVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conv: ChatConversation) => void;
  onChangeSecretCode: () => void;
}

export const HiddenVaultModal: React.FC<HiddenVaultModalProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onChangeSecretCode,
}) => {
  const {
    conversations,
    stories,
    posts,
    unhideChat,
    updateChatVaultConfig,
    isVaultNotificationsEnabled,
    toggleVaultNotifications,
    defaultVaultConfig,
    updateDefaultVaultConfig,
    setActiveStoryUserIndex,
    setSelectedPostForModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chats' | 'stories' | 'posts'>('chats');
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [showDefaultSettingsModal, setShowDefaultSettingsModal] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Hidden conversations
  const hiddenConversations = conversations.filter(c => c.isHiddenChat);

  // Hidden contacts user IDs
  const hiddenUsersMap = new Map<string, ChatConversation>(
    hiddenConversations
      .filter(c => c.participant?.id)
      .map(c => [c.participant.id, c])
  );

  // Hidden Stories (for users who have hideStories !== false)
  const hiddenStories = stories.filter(s => {
    if (!s?.user?.id) return false;
    const conv = hiddenUsersMap.get(s.user.id);
    return conv && (conv.hiddenVaultConfig?.hideStories !== false);
  });

  // Hidden Posts (for users who have hidePosts !== false)
  const hiddenPosts = posts.filter(p => {
    if (!p?.user?.id) return false;
    const conv = hiddenUsersMap.get(p.user.id);
    return conv && (conv.hiddenVaultConfig?.hidePosts !== false);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 md:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[750px]">
        {/* Vault Header: Back on left, title in middle, 3-DOT MENU ONLY ON TOP-RIGHT as requested! */}
        <div className="p-4 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 shrink-0 relative">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
              title="Lock & Exit Vault"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Secret Vault
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                    Locked
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protected chats, stories & posts
                </p>
              </div>
            </div>
          </div>

          {/* Top-Right: 3-DOT MENU ONLY */}
          <div className="relative">
            <button
              type="button"
              id="vault-top-3dot-btn"
              onClick={() => setShowTopMenu(!showTopMenu)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
              title="Vault Settings & Preferences"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* 3-Dot Dropdown Menu */}
            {showTopMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTopMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {/* Notifications Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleVaultNotifications();
                      setShowTopMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-750 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {isVaultNotificationsEnabled ? (
                        <Bell className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Vault Notifications
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isVaultNotificationsEnabled ? 'Enabled' : 'Muted'}
                        </p>
                      </div>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full ${isVaultNotificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-750" />

                  {/* Choose what to hide (Default Preferences) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopMenu(false);
                      setShowDefaultSettingsModal(true);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 text-left transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="font-semibold">Default Hide Preferences</p>
                      <p className="text-[10px] text-slate-400">Choose default for chats, stories, posts</p>
                    </div>
                  </button>

                  {/* Change Secret Code */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopMenu(false);
                      onChangeSecretCode();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 text-left transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <Key className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="font-semibold">Change Secret Code</p>
                      <p className="text-[10px] text-slate-400">Update code or verify via email</p>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-750" />

                  {/* Lock & Exit */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopMenu(false);
                      onClose();
                      showToast('Secret Vault locked');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 text-left transition-colors text-rose-600 dark:text-rose-400 font-semibold"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock & Exit Vault</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vault Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/40 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chats'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Hidden Chats</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'chats' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {hiddenConversations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'stories'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hidden Stories</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'stories' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {hiddenStories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Hidden Posts</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'posts' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {hiddenPosts.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {/* TAB 1: CHATS */}
          {activeTab === 'chats' && (
            <div className="space-y-3">
              {hiddenConversations.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Hidden Chats</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    To hide a chat, open any conversation's 3-dot menu and select "Hide chat". Enter your secret code to secure it in this vault.
                  </p>
                </div>
              ) : (
                hiddenConversations.map(conv => {
                  const cfg = conv.hiddenVaultConfig || defaultVaultConfig;
                  const isEditing = editingConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          onClick={() => {
                            onSelectConversation(conv);
                            onClose();
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          <img
                            src={conv.isGroup ? (conv.groupAvatar || conv.participant.avatar) : conv.participant.avatar}
                            alt={conv.participant.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {conv.isGroup ? conv.groupName : conv.participant.name}
                              </h4>
                              {conv.unreadCount ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                                  {conv.unreadCount}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingConvId(isEditing ? null : conv.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                            title="Configure What to Hide"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectConversation(conv);
                              onClose();
                            }}
                            className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Granular Visibility Config Toggles */}
                      {isEditing && (
                        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2.5 animate-in fade-in duration-100">
                          <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            Visibility for {conv.isGroup ? conv.groupName : conv.participant.name}:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.hideChat}
                                onChange={e => updateChatVaultConfig(conv.id, { hideChat: e.target.checked })}
                                className="w-3.5 h-3.5 text-indigo-600 rounded"
                              />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                Hide Chat
                              </span>
                            </label>

                            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.hideStories}
                                onChange={e => updateChatVaultConfig(conv.id, { hideStories: e.target.checked })}
                                className="w-3.5 h-3.5 text-indigo-600 rounded"
                              />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                Hide Stories
                              </span>
                            </label>

                            <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.hidePosts}
                                onChange={e => updateChatVaultConfig(conv.id, { hidePosts: e.target.checked })}
                                className="w-3.5 h-3.5 text-indigo-600 rounded"
                              />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                Hide Posts
                              </span>
                            </label>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                unhideChat(conv.id);
                                setEditingConvId(null);
                              }}
                              className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                            >
                              Unhide & Restore to Regular Inbox
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: STORIES */}
          {activeTab === 'stories' && (
            <div>
              {hiddenStories.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Hidden Stories</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Stories from contacts hidden in this vault will appear exclusively here instead of the public feed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {hiddenStories.map(story => {
                    const storyIdx = stories.findIndex(s => s.id === story.id);
                    return (
                      <div
                        key={story.id}
                        onClick={() => {
                          if (storyIdx !== -1) {
                            setActiveStoryUserIndex(storyIdx);
                          }
                        }}
                        className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-md bg-slate-900"
                      >
                        <img
                          src={story.mediaUrl || story.user?.avatar}
                          alt={story.user?.name || 'Story'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2.5 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={story.user?.avatar}
                              alt={story.user?.name || 'User'}
                              className="w-6 h-6 rounded-full ring-1 ring-white"
                            />
                            <span className="text-[11px] font-bold text-white truncate drop-shadow-xs">
                              {story.user?.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-300 font-medium">
                            {story.timestamp || 'Active'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POSTS */}
          {activeTab === 'posts' && (
            <div>
              {hiddenPosts.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Grid className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Hidden Posts</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Posts from contacts with "Hide Posts" enabled will only appear here and will be hidden from the regular feed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {hiddenPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostForModal(post)}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src={post.mediaUrls?.[0] || post.mediaUrl || post.image}
                        alt={post.caption || 'Post image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-white" />
                          <span>{post.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submodal: Default Hide Settings */}
        {showDefaultSettingsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-100">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Default Hide Preferences</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDefaultSettingsModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                When you hide a contact, these options will be selected by default:
              </p>

              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={defaultVaultConfig.hideChat}
                    onChange={e => updateDefaultVaultConfig({ hideChat: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Hide chats & direct messages</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={defaultVaultConfig.hideStories}
                    onChange={e => updateDefaultVaultConfig({ hideStories: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Hide stories from feed</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={defaultVaultConfig.hidePosts}
                    onChange={e => updateDefaultVaultConfig({ hidePosts: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Hide posts from feed & explore</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDefaultSettingsModal(false);
                    showToast('Default vault preferences updated');
                  }}
                  className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
