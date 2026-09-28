import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Hash,
  Send,
  Image,
  Smile,
  Shield,
  Clock,
  Filter,
  Check,
  Plus,
  CornerDownRight,
  User,
  Sliders,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Community, CommunityChatMessage } from '../types';
import { FormattedText } from './FormattedText';
import { EmojiKitchenModal } from './EmojiKitchenModal';
import { EmojiBlendSuggestionBanner } from './EmojiBlendSuggestionBanner';
import {
  detectEmojiBlendInText,
  formatBlendToken,
  getBlendById
} from '../data/emojiKitchen';

interface CommunityChannelsChatProps {
  community: Community;
}

const CHAT_REACTIONS = ['👍', '❤️', '🔥', '👏', '💡', '📸'];

export const CommunityChannelsChat: React.FC<CommunityChannelsChatProps> = ({ community }) => {
  const {
    currentUser,
    communityChatMessages,
    sendCommunityChatMessage,
    reactToCommunityChatMessage,
    communityPersonas,
    setCommunityPersona,
    updateCommunityModeration,
    showToast
  } = useApp();

  const channels = community.channels && community.channels.length > 0
    ? community.channels
    : [
        { id: 'general', name: 'general', description: 'General community discussion' },
        { id: 'critique', name: 'critique-and-feedback', description: 'Constructive feedback & sharing' },
        { id: 'gear', name: 'gear-talk', description: 'Cameras, lenses, and workflows' },
        { id: 'meetups', name: 'meetups-and-events', description: 'Nearby photo walks and outings' }
      ];

  const [activeChannelId, setActiveChannelId] = useState<string>(channels[0]?.id || 'general');
  const [inputText, setInputText] = useState('');
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [dismissedBlendKey, setDismissedBlendKey] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommunityChatMessage | null>(null);
  const [showEmojiPickerForMsgId, setShowEmojiPickerForMsgId] = useState<string | null>(null);
  const [showModSettings, setShowModSettings] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // Slow mode throttle tracking
  const [lastSentTime, setLastSentTime] = useState<number>(0);
  const [slowModeCountdown, setSlowModeCountdown] = useState<number>(0);

  // Persona State
  const currentPersona = communityPersonas[community.id] || {
    displayName: currentUser.name,
    avatar: currentUser.avatar,
    customBio: ''
  };
  const [personaName, setPersonaName] = useState(currentPersona.displayName);
  const [personaAvatar, setPersonaAvatar] = useState(currentPersona.avatar);

  // Moderator state
  const isMod = community.ownerId === currentUser.id || (community.moderators && community.moderators.includes(currentUser.id));
  const modSettings = community.moderationSettings || {
    slowModeSeconds: 0,
    wordFilter: ['spam', 'buy-now', 'crypto'],
    requireApproval: false
  };

  const [newWordFilter, setNewWordFilter] = useState('');

  const messagesKey = `${community.id}_${activeChannelId}`;
  const messages = communityChatMessages[messagesKey] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeChannelId]);

  // Handle slow mode countdown
  useEffect(() => {
    if (slowModeCountdown > 0) {
      const timer = setTimeout(() => setSlowModeCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [slowModeCountdown]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !mediaUrl) return;

    // Check slow mode
    if (modSettings.slowModeSeconds > 0) {
      const now = Date.now();
      const elapsed = (now - lastSentTime) / 1000;
      if (elapsed < modSettings.slowModeSeconds) {
        setSlowModeCountdown(Math.ceil(modSettings.slowModeSeconds - elapsed));
        showToast(`Slow mode active: wait ${Math.ceil(modSettings.slowModeSeconds - elapsed)}s`);
        return;
      }
    }

    // Check word filter
    if (modSettings.wordFilter && modSettings.wordFilter.length > 0) {
      const lower = inputText.toLowerCase();
      const triggered = modSettings.wordFilter.find(w => lower.includes(w.toLowerCase()));
      if (triggered) {
        showToast(`Message contains filtered term "${triggered}". Please revise.`);
        return;
      }
    }

    sendCommunityChatMessage({
      communityId: community.id,
      channelId: activeChannelId,
      text: inputText.trim(),
      mediaUrl: mediaUrl.trim() || undefined,
      replyToId: replyingTo?.id
    });

    setInputText('');
    setMediaUrl('');
    setReplyingTo(null);
    setLastSentTime(Date.now());
    if (modSettings.slowModeSeconds > 0) {
      setSlowModeCountdown(modSettings.slowModeSeconds);
    }
  };

  const handleSavePersona = (e: React.FormEvent) => {
    e.preventDefault();
    setCommunityPersona(community.id, {
      displayName: personaName.trim() || currentUser.name,
      avatar: personaAvatar.trim() || currentUser.avatar,
      customBio: currentPersona.customBio
    });
    setShowPersonaModal(false);
    showToast('Community persona updated');
  };

  const handleAddWordFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordFilter.trim()) return;
    const clean = newWordFilter.trim().toLowerCase();
    if (!modSettings.wordFilter.includes(clean)) {
      updateCommunityModeration(community.id, {
        ...modSettings,
        wordFilter: [...modSettings.wordFilter, clean]
      });
      showToast(`Added "${clean}" to word filter`);
    }
    setNewWordFilter('');
  };

  const handleRemoveWordFilter = (word: string) => {
    updateCommunityModeration(community.id, {
      ...modSettings,
      wordFilter: modSettings.wordFilter.filter(w => w !== word)
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row h-[560px] shadow-sm mb-6">
      {/* Channels Sidebar */}
      <div className="w-full md:w-60 border-r border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40 p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Channels
            </span>
            {isMod && (
              <button
                type="button"
                onClick={() => setShowModSettings(!showModSettings)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs flex items-center gap-1 font-semibold"
                title="Moderation Settings"
              >
                <Shield className="w-3.5 h-3.5" />
                Mod
              </button>
            )}
          </div>

          <div className="space-y-1">
            {channels.map(channel => (
              <button
                key={channel.id}
                type="button"
                onClick={() => {
                  setActiveChannelId(channel.id);
                  setShowModSettings(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeChannelId === channel.id && !showModSettings
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0 opacity-75" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Persona Switcher Pill */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowPersonaModal(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentPersona.avatar}
                alt=""
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="truncate text-left">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                  {currentPersona.displayName}
                </div>
                <div className="text-[9px] text-slate-400">Community Identity</div>
              </div>
            </div>
            <User className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Chat Area OR Mod Dashboard */}
      {showModSettings && isMod ? (
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Moderator Dashboard & Channel Protection
              </h3>
            </div>
            <button
              onClick={() => setShowModSettings(false)}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Back to Chat
            </button>
          </div>

          {/* Slow Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Slow Mode Rate Limiting
            </label>
            <div className="flex gap-2">
              {[0, 5, 15, 30, 60].map(sec => (
                <button
                  key={sec}
                  onClick={() =>
                    updateCommunityModeration(community.id, {
                      ...modSettings,
                      slowModeSeconds: sec
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    modSettings.slowModeSeconds === sec
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sec === 0 ? 'Off' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Word Filters */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              Prohibited Words & Filters
            </label>
            <form onSubmit={handleAddWordFilter} className="flex gap-2">
              <input
                type="text"
                value={newWordFilter}
                onChange={e => setNewWordFilter(e.target.value)}
                placeholder="Add restricted word or phrase..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="submit"
                disabled={!newWordFilter.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {modSettings.wordFilter.map(word => (
                <span
                  key={word}
                  className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-1"
                >
                  {word}
                  <button
                    onClick={() => handleRemoveWordFilter(word)}
                    className="hover:text-rose-900 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Contextual Reputation Policy */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Contextual Badges Enabled
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Members earn context-specific badges (e.g. "Helpful Contributor — {community.category}") based on discussion quality rather than addictive numeric karma.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Channel Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {activeChannelId}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                • Real-time channel chat
              </span>
            </div>

            {modSettings.slowModeSeconds > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                Slow Mode: {modSettings.slowModeSeconds}s
              </span>
            )}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No messages in #{activeChannelId} yet.</p>
                <p className="text-[11px]">Say hello and start the community conversation!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isSelf = msg.userId === currentUser.id;
                const repliedMsg = msg.replyToId
                  ? messages.find(m => m.id === msg.replyToId)
                  : null;

                return (
                  <div key={msg.id} className="group flex flex-col gap-1">
                    {/* Quoted reply header */}
                    {repliedMsg && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-9">
                        <CornerDownRight className="w-3 h-3" />
                        <span>Replying to @{repliedMsg.authorName}:</span>
                        <span className="truncate max-w-[200px] italic">"{repliedMsg.text}"</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      <img
                        src={msg.authorAvatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {msg.authorName}
                          </span>
                          {/* Contextual Badge */}
                          {msg.authorBadge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" />
                              {msg.authorBadge}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                          {/* Action icons on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(msg)}
                              className="text-[10px] text-slate-400 hover:text-indigo-600 p-0.5"
                              title="Reply"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setShowEmojiPickerForMsgId(
                                  showEmojiPickerForMsgId === msg.id ? null : msg.id
                                )
                              }
                              className="text-[10px] text-slate-400 hover:text-indigo-600 p-0.5"
                              title="Add reaction"
                            >
                              <Smile className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="text-xs text-slate-700 dark:text-slate-200 mt-0.5 break-words">
                          <FormattedText text={msg.text} />
                        </div>

                        {/* Attached Media */}
                        {msg.mediaUrl && (
                          <div className="mt-1.5 max-w-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              className="w-full max-h-48 object-cover"
                            />
                          </div>
                        )}

                        {/* Emoji Reactions display */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, uids]) => {
                              const isKitchenBlend = emoji.startsWith('[kitchen:');
                              const blend = isKitchenBlend ? getBlendById(emoji.slice(9, -1)) : null;
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() =>
                                    reactToCommunityChatMessage(
                                      community.id,
                                      activeChannelId,
                                      msg.id,
                                      emoji
                                    )
                                  }
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                                  title={blend ? blend.name : emoji}
                                >
                                  {blend ? (
                                    <img src={blend.assetUrl} alt={blend.name} className="w-3.5 h-3.5 object-contain" />
                                  ) : (
                                    <span>{emoji}</span>
                                  )}
                                  <span className="font-mono">
                                    {Array.isArray(uids) ? uids.length : 1}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Reaction Picker Popup */}
                        {showEmojiPickerForMsgId === msg.id && (
                          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mt-1 w-max">
                            {CHAT_REACTIONS.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  reactToCommunityChatMessage(
                                    community.id,
                                    activeChannelId,
                                    msg.id,
                                    emoji
                                  );
                                  setShowEmojiPickerForMsgId(null);
                                }}
                                className="p-1 hover:scale-125 transition-transform text-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Replying banner */}
          {replyingTo && (
            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border-t border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
              <span className="truncate">Replying to @{replyingTo.authorName}: "{replyingTo.text}"</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-indigo-500 hover:text-indigo-700 ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Real-time Emoji Kitchen blend suggestion banner */}
          {(() => {
            const detected = detectEmojiBlendInText(inputText);
            if (detected && dismissedBlendKey !== `${detected.blend.id}_${detected.match}`) {
              return (
                <div className="px-3 pt-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  <EmojiBlendSuggestionBanner
                    blend={detected.blend}
                    onApplyBlend={blend => {
                      const token = formatBlendToken(blend);
                      setInputText(prev => prev.replace(detected.match, `${token} `));
                    }}
                    onOpenKitchen={() => setIsKitchenOpen(true)}
                    onDismiss={() => {
                      setDismissedBlendKey(`${detected.blend.id}_${detected.match}`);
                    }}
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => {
                const sample = prompt('Enter image URL or photo link:');
                if (sample) setMediaUrl(sample);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Add image"
            >
              <Image className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsKitchenOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
              title="Emoji Kitchen Lab"
              aria-label="Emoji Kitchen"
            >
              🧪
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                slowModeCountdown > 0
                  ? `Slow mode: wait ${slowModeCountdown}s...`
                  : `Message #${activeChannelId} as ${currentPersona.displayName}...`
              }
              disabled={slowModeCountdown > 0}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !mediaUrl) || slowModeCountdown > 0}
              className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Community Persona Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSavePersona}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" />
                Community Persona
              </span>
              <button
                type="button"
                onClick={() => setShowPersonaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize how you appear in <strong>{community.name}</strong> without changing your global account profile.
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={personaName}
                  onChange={e => setPersonaName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Avatar Image URL</label>
                <input
                  type="text"
                  value={personaAvatar}
                  onChange={e => setPersonaAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPersonaModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Save Persona
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Emoji Kitchen Modal for Community Channel Chat */}
      {isKitchenOpen && (
        <EmojiKitchenModal
          isOpen={isKitchenOpen}
          onClose={() => setIsKitchenOpen(false)}
          onSelectBlend={(blend) => {
            const token = formatBlendToken(blend);
            setInputText(prev => (prev ? `${prev} ${token}` : token));
            setIsKitchenOpen(false);
          }}
          insertButtonLabel="Add to Channel"
        />
      )}
    </div>
  );
};
