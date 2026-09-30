// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Image as ImageIcon,
  Heart,
  Phone,
  Video,
  Info,
  Search,
  SquarePen,
  ChevronLeft,
  X,
  Check,
  CheckCheck,
  Clock,
  Mic,
  Square,
  Trash2,
  CornerUpLeft,
  Film,
  FileText,
  Lock,
  Sparkles,
  MoreVertical,
  Eye,
  EyeOff,
  Key,
  Users,
  Globe,
  Unlock,
  Shield,
  Plus,
  Ban,
  Mail,
  Paperclip,
  Archive,
  Bell,
  BellOff,
  Pin,
  PinOff,
  FolderPlus,
  Eraser,
  ShieldAlert,
  Tag,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Palette
} from 'lucide-react';
import { ChatWallpapersModal } from './chat/ChatWallpapersModal';
import { useApp } from '../context/AppContext';
import {
  ChatMessage,
  DocumentData,
  AudioData,
  ContactData,
  LocationData,
  PollData,
  GameSession,
  GameType,
  UserSummary,
  ChatConversation,
  ChatCustomList,
  ScheduledChatMessage
} from '../types';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { MediaAttachmentModal } from './MediaAttachmentModal';
import { FormattedText } from './FormattedText';
import { EmojiKitchenModal } from './EmojiKitchenModal';
import { EmojiBlendSuggestionBanner } from './EmojiBlendSuggestionBanner';
import { ChatAttachmentMenu, AttachmentMenuOption } from './chat/ChatAttachmentMenu';
import { GamesSelectorModal } from './chat/GamesSelectorModal';
import { DocumentAttachmentModal } from './chat/DocumentAttachmentModal';
import { MusicAttachmentModal } from './chat/MusicAttachmentModal';
import { ContactAttachmentModal } from './chat/ContactAttachmentModal';
import { LocationAttachmentModal } from './chat/LocationAttachmentModal';
import { PollCreateModal } from './chat/PollCreateModal';
import { ChatMessageAttachment } from './chat/ChatMessageAttachment';
import { AddToListModal } from './chat/AddToListModal';
import { BlockUserModal } from './chat/BlockUserModal';
import { ScheduleMessageModal } from './chat/ScheduleMessageModal';
import { GroupInfoModal } from './GroupInfoModal';
import { ExitGroupModal, ReportGroupModal } from './GroupActionModals';
import { HiddenVaultModal } from './chat/HiddenVaultModal';
import { EnterSecretCodeModal } from './chat/EnterSecretCodeModal';
import { ChangeSecretCodeModal } from './chat/ChangeSecretCodeModal';
import { SupportBotActionButtons } from './chat/SupportBotActionButtons';
import { SUPPORT_BOT_USER } from '../utils/supportBot';
import {
  detectEmojiBlendInText,
  formatBlendToken
} from '../data/emojiKitchen';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    currentUser,
    sendMessage,
    votePoll,
    updateGameSession,
    sendVoiceMessage,
    sendMediaMessage,
    triggerTypingIndicator,
    clearConversation,
    deleteConversation,
    blockUser,
    blockAndReportUser,
    markConversationAsRead,
    markConversationAsUnread,
    togglePinConversation,
    toggleMuteConversation,
    toggleArchiveConversation,
    chatLists,
    createChatList,
    deleteChatList,
    toggleChatInList,
    setConversationLists,
    showToast,
    activeConvId,
    setActiveConvId,
    allUsers,
    startConversationWithUser,
    openUserProfile,
    isChatLocked,
    chatPasscode,
    setIsChatLocked,
    toggleHideChat,
    unhideChat,
    chatSecretCode,
    setChatSecretCode,
    requestAppPermission,
    createGroupChat,
    stories,
    setActiveStoryUserIndex,
    setActiveTab
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [dismissedChatBlendKey, setDismissedChatBlendKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListFilter, setSelectedListFilter] = useState<string>('all');
  const [listModalConv, setListModalConv] = useState<ChatConversation | null>(null);
  const [blockModalUser, setBlockModalUser] = useState<{ conv: ChatConversation; user: UserSummary } | null>(null);
  const [convToClear, setConvToClear] = useState<ChatConversation | null>(null);
  const [convToDelete, setConvToDelete] = useState<ChatConversation | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('connecthub_scheduled_msgs') || '[]');
    } catch {
      return [];
    }
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isViewingArchivedSection, setIsViewingArchivedSection] = useState(false);

  // Hidden chats & secret vault management
  const [showHiddenVaultModal, setShowHiddenVaultModal] = useState(false);
  const [showEnterSecretCodeModal, setShowEnterSecretCodeModal] = useState(false);
  const [showChangeSecretCodeModal, setShowChangeSecretCodeModal] = useState(false);
  const [hidingConversation, setHidingConversation] = useState<{ id: string; title: string } | null>(null);
  const [openConvMenuId, setOpenConvMenuId] = useState<string | null>(null);
  const [chatHeaderMenuOpen, setChatHeaderMenuOpen] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  // Group chat creation state
  const [newChatTab, setNewChatTab] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIsPublic, setGroupIsPublic] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  // Group Info & Group Actions modal states
  const [selectedGroupForInfo, setSelectedGroupForInfo] = useState<ChatConversation | null>(null);
  const [groupToExit, setGroupToExit] = useState<ChatConversation | null>(null);
  const [groupToReport, setGroupToReport] = useState<ChatConversation | null>(null);

  // Quote / Reply state
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);

  // In-composer Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordTimerRef = useRef<number | null>(null);

  // Long press detection for mobile
  const longPressTimerRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set default active conversation if none selected
  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, activeConversation?.isTyping]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (isChatLocked && chatPasscode) return;
    if (activeConversation && activeConversation.unreadCount > 0) {
      markConversationAsRead(activeConversation.id);
    }
  }, [activeConversation?.id, activeConversation?.unreadCount, isChatLocked, chatPasscode, markConversationAsRead]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, [isRecording]);

  // Background checker for scheduled messages dispatch
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setScheduledMessages(prev => {
        const due = prev.filter(m => m.scheduledForMs <= now);
        const remaining = prev.filter(m => m.scheduledForMs > now);
        if (due.length > 0) {
          due.forEach(m => {
            sendMessage(m.conversationId, m.text);
          });
          showToast(`Delivered ${due.length} scheduled message${due.length > 1 ? 's' : ''}`);
          try {
            localStorage.setItem('connecthub_scheduled_msgs', JSON.stringify(remaining));
          } catch {}
          return remaining;
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [sendMessage, showToast]);

  // Intercept Secret Code typed into search bar to unlock Secret Vault!
  useEffect(() => {
    if (chatSecretCode && searchQuery === chatSecretCode) {
      setShowHiddenVaultModal(true);
      setSearchQuery('');
    }
  }, [searchQuery, chatSecretCode]);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setMobileShowChat(true);
    markConversationAsRead(id);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, inputText.trim(), {
      replyTo: replyingTo || undefined
    });

    setInputText('');
    setReplyingTo(null);
  };

  const handleSendHeart = () => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, '❤️', {
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
  };

  // Voice Recording handlers
  const handleStartRecording = async () => {
    const granted = await requestAppPermission('microphone', 'voice note recording');
    if (!granted) return;
    setIsRecording(true);
    showToast('Recording voice note... speak now');
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
    showToast('Voice note discarded');
  };

  const handleFinishAndSendVoice = () => {
    if (!activeConversation) return;
    const duration = Math.max(1, recordingSeconds);
    sendVoiceMessage(activeConversation.id, duration, replyingTo || undefined);
    setIsRecording(false);
    setRecordingSeconds(0);
    setReplyingTo(null);
    showToast(`Voice note (${duration}s) sent!`);
  };

  // Media Attachment handler
  const handleSendMedia = (mediaUrl: string, mediaType: 'image' | 'video' | 'file', caption: string, fileName?: string) => {
    if (!activeConversation) return;
    sendMediaMessage(activeConversation.id, mediaUrl, mediaType, caption, fileName, replyingTo || undefined);
    setReplyingTo(null);
  };

  const handleSelectAttachmentOption = async (option: AttachmentMenuOption) => {
    setShowAttachmentMenu(false);
    switch (option) {
      case 'media': {
        const granted = await requestAppPermission('storage', 'photo and video attachments');
        if (!granted) return;
        setShowMediaModal(true);
        break;
      }
      case 'documents': {
        const granted = await requestAppPermission('storage', 'document attachments');
        if (!granted) return;
        setShowDocumentModal(true);
        break;
      }
      case 'music': {
        const granted = await requestAppPermission('storage', 'music audio files');
        if (!granted) return;
        setShowMusicModal(true);
        break;
      }
      case 'contact':
        setShowContactModal(true);
        break;
      case 'location': {
        const granted = await requestAppPermission('location', 'location sharing');
        if (!granted) return;
        setShowLocationModal(true);
        break;
      }
      case 'poll':
        setShowPollModal(true);
        break;
      case 'schedule':
        setShowScheduleModal(true);
        break;
      case 'games':
        setShowGamesModal(true);
        break;
    }
  };

  const handleScheduleMessage = (text: string, scheduledForMs: number) => {
    if (!activeConversation) return;
    const newScheduled: ScheduledChatMessage = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: activeConversation.id,
      text,
      scheduledForMs,
      createdAt: Date.now()
    };
    setScheduledMessages(prev => {
      const updated = [...prev, newScheduled];
      try {
        localStorage.setItem('connecthub_scheduled_msgs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const timeLabel = new Date(scheduledForMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    showToast(`Message scheduled for ${timeLabel}!`);
  };

  const handleCancelScheduledMessage = (id: string) => {
    setScheduledMessages(prev => {
      const updated = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem('connecthub_scheduled_msgs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Scheduled message canceled');
  };

  const handleSendDocument = (doc: DocumentData, caption?: string) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, caption || '', {
      documentData: doc,
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
    showToast(`Shared document "${doc.fileName}"`);
  };

  const handleSendMusic = (music: AudioData, caption?: string) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, caption || '', {
      audioData: music,
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
    showToast(`Shared audio "${music.title}"`);
  };

  const handleSendContact = (contact: ContactData) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, '', {
      contactData: contact,
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
    showToast(`Shared contact card for ${contact.name}`);
  };

  const handleSendLocation = (loc: LocationData) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, '', {
      locationData: loc,
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
    showToast(`Shared location: ${loc.name}`);
  };

  const handleSendPoll = (poll: PollData) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, '', {
      pollData: poll,
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
    showToast(`Created poll: "${poll.question}"`);
  };

  const handleSelectGame = (gameType: GameType, gameTitle: string) => {
    if (!activeConversation) return;
    const session: GameSession = {
      gameId: `game_${Date.now()}`,
      gameType,
      gameTitle,
      hostId: currentUser.id,
      hostName: currentUser.name,
      opponentId: activeConversation.participant.id,
      opponentName: activeConversation.participant.name,
      status: 'invitation',
      createdAt: Date.now()
    };
    sendMessage(activeConversation.id, '', {
      gameSession: session,
      replyTo: replyingTo || undefined
    });
    setReplyingTo(null);
    showToast(`Sent ${gameTitle} game invitation!`);
  };

  const handleStartNewChat = (user: { id: string; username: string; name: string; avatar: string }) => {
    startConversationWithUser(user);
    setShowNewChatModal(false);
    setUserSearchQuery('');
    setMobileShowChat(true);
  };

  // Long press handler for replying on touch/mouse
  const handleTouchStart = (msg: ChatMessage, senderName: string) => {
    longPressTimerRef.current = window.setTimeout(() => {
      setReplyingTo({
        id: msg.id,
        text: msg.isVoice ? '🎙️ Voice note' : msg.mediaUrl ? '📷 Media' : msg.text,
        senderName
      });
      showToast(`Replying to ${senderName}`);
      inputRef.current?.focus();
    }, 550);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const archivedCount = conversations.filter(c => !c.isHiddenChat && c.isArchived).length;

  const filteredConversations = conversations
    .filter(c => {
      if (c.isHiddenChat) {
        return false;
      }

      const matchesSearch =
        c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.isGroup && c.groupName?.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // When in dedicated WhatsApp-style Archived Section, display only archived chats
      if (isViewingArchivedSection) {
        return Boolean(c.isArchived);
      }

      // In main chat list and custom lists, archived chats are excluded (moved to archive section)
      if (c.isArchived) {
        return false;
      }

      // 'All' shows every chat (unless hidden or archived)
      if (selectedListFilter === 'all') {
        return true;
      }

      // Custom list filter (e.g., list_school, list_family)
      return Boolean(c.listIds?.includes(selectedListFilter));
    })
    .sort((a, b) => {
      // Pinned chats appear at the top!
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  // Stories for hidden contacts (shown strictly in the locked column)
  const hiddenUserIds = new Set(conversations.filter(c => c.isHiddenChat).map(c => c.participant.id));
  const hiddenContactsStories = stories.filter(s => hiddenUserIds.has(s.user.id));

  // Search across all community users for initiating a new chat
  const searchableUsers = allUsers.filter(u =>
    u.id !== currentUser.id &&
    (u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
     u.name.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full border-x border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden select-none">
      {/* Conversations Sidebar */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shrink-0 ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header with Lock Toggle & New Chat OR Archived Section Header */}
        {isViewingArchivedSection ? (
          <div className="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-850/70">
            <button
              type="button"
              onClick={() => setIsViewingArchivedSection(false)}
              className="p-1.5 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
              title="Back to Chats"
              aria-label="Back to inbox"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Archived Chats</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300">
                  {archivedCount}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                These chats stay archived when new messages are received
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Direct Messages</h2>
              {chatPasscode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsChatLocked(true);
                    showToast('Direct Messages locked');
                  }}
                  className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Lock Messages with PIN"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                id="messages-communities-btn"
                onClick={() => setActiveTab('communities')}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Communities & Channels"
                aria-label="Communities"
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                id="new-chat-btn"
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Compose message or create group"
              >
                <SquarePen className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isViewingArchivedSection ? "Search archived chats..." : "Search chats..."}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>
        </div>

        {/* Chat Classification List Tabs (Only shown in main inbox, not in archive section) */}
        {!isViewingArchivedSection && (
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {/* All Tab */}
            <button
              type="button"
              onClick={() => setSelectedListFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedListFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>

            {/* User Custom Lists */}
            {chatLists.map(list => {
              const isSelected = selectedListFilter === list.id;
              const count = conversations.filter(c => !c.isHiddenChat && !c.isArchived && c.listIds?.includes(list.id)).length;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedListFilter(list.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{list.name}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Create New List Button */}
            <button
              type="button"
              onClick={() => {
                const listName = prompt('Enter name for the new chat list (e.g., Work, Close Friends):');
                if (listName && listName.trim()) {
                  createChatList(listName.trim());
                  showToast(`Created list "${listName.trim()}"`);
                }
              }}
              className="p-1 px-2.5 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 shrink-0 flex items-center gap-1 transition-colors"
              title="Create new chat list"
            >
              <Plus className="w-3 h-3" />
              <span>New List</span>
            </button>
          </div>
        )}

        {/* WhatsApp-style Dedicated Archived Section Banner (at the top of chats, not in lists) */}
        {!isViewingArchivedSection && archivedCount > 0 && (
          <button
            type="button"
            onClick={() => setIsViewingArchivedSection(true)}
            className="w-full px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group bg-slate-50/40 dark:bg-slate-850/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-750 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Archived
                </div>
                <div className="text-[10px] text-slate-400">
                  {archivedCount} {archivedCount === 1 ? 'chat' : 'chats'} moved to archive
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                {archivedCount}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeConversation?.id;
              const isMenuOpen = openConvMenuId === conv.id;

              return (
                <div
                  key={conv.id}
                  id={`conv-item-${conv.id}`}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3 px-4 flex items-center gap-3 cursor-pointer transition-colors relative group ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-l-4 border-indigo-600 dark:border-indigo-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.participant.avatar}
                      alt={conv.participant.username}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    {conv.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                    {conv.isGroup && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-slate-900" title="Group Chat">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1">
                          {conv.participant.name}
                          {conv.participant.id === SUPPORT_BOT_USER.id && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              Bot
                            </span>
                          )}
                          {conv.isGroup && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                              ({conv.isPublic ? 'Public' : 'Private'})
                            </span>
                          )}
                        </p>
                        {conv.isPinned && (
                          <span title="Pinned chat">
                            <Pin className="w-3 h-3 text-indigo-500 fill-indigo-500/20 shrink-0" />
                          </span>
                        )}
                        {conv.isMuted && (
                          <span title="Muted chat">
                            <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                          </span>
                        )}
                        {conv.isArchived && (
                          <span title="Archived chat">
                            <Archive className="w-3 h-3 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {/* Custom List Labels if any */}
                    {conv.listIds && conv.listIds.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                        {conv.listIds.map(lid => {
                          const lObj = chatLists.find(l => l.id === lid);
                          if (!lObj) return null;
                          return (
                            <span
                              key={lid}
                              className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shrink-0 truncate max-w-[80px]"
                            >
                              {lObj.name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.isTyping ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                            typing...
                          </span>
                        ) : (
                          conv.lastMessage
                        )}
                      </p>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}

                        {/* 3-dot action button on hover / active */}
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setOpenConvMenuId(isMenuOpen ? null : conv.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Chat options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setOpenConvMenuId(null)}
                              />
                              <div className="absolute right-0 top-6 z-30 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1 text-xs text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-700/60">
                                <div className="py-1">
                                  {/* 1. Archive / Unarchive */}
                                  <button
                                    onClick={() => {
                                      toggleArchiveConversation(conv.id);
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                    <span>{conv.isArchived ? 'Unarchive chat' : 'Archive chat'}</span>
                                  </button>

                                  {/* 2. Mute / Unmute */}
                                  <button
                                    onClick={() => {
                                      toggleMuteConversation(conv.id);
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    {conv.isMuted ? (
                                      <>
                                        <Bell className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Unmute chat</span>
                                      </>
                                    ) : (
                                      <>
                                        <BellOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Mute chat</span>
                                      </>
                                    )}
                                  </button>

                                  {/* 3. Pin / Unpin */}
                                  <button
                                    onClick={() => {
                                      togglePinConversation(conv.id);
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    {conv.isPinned ? (
                                      <>
                                        <PinOff className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Unpin chat</span>
                                      </>
                                    ) : (
                                      <>
                                        <Pin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Pin chat</span>
                                      </>
                                    )}
                                  </button>

                                  {/* 4. Hide / Unhide */}
                                  <button
                                    onClick={() => {
                                      setOpenConvMenuId(null);
                                      if (conv.isHiddenChat) {
                                        unhideChat(conv.id);
                                      } else {
                                        setHidingConversation({
                                          id: conv.id,
                                          title: conv.isGroup ? (conv.groupName || 'Group') : conv.participant.name
                                        });
                                        setShowEnterSecretCodeModal(true);
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    {conv.isHiddenChat ? (
                                      <>
                                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Unhide chat</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Hide chat</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* 5. Add to list */}
                                  <button
                                    onClick={() => {
                                      setListModalConv(conv);
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Add to list</span>
                                  </button>

                                  {/* 6. Mark as unread / Mark as read */}
                                  <button
                                    onClick={() => {
                                      if (conv.unreadCount > 0) {
                                        markConversationAsRead(conv.id);
                                        showToast(`Marked chat as read`);
                                      } else {
                                        markConversationAsUnread(conv.id);
                                        showToast(`Marked chat with ${conv.participant.name} as unread`);
                                      }
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    {conv.unreadCount > 0 ? (
                                      <>
                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Mark as read</span>
                                      </>
                                    ) : (
                                      <>
                                        <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Mark as unread</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* 7. Clear message */}
                                  <button
                                    onClick={() => {
                                      setConvToClear(conv);
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Eraser className="w-3.5 h-3.5" />
                                    <span>Clear message</span>
                                  </button>

                                  {/* 8. Delete chat */}
                                  <button
                                    onClick={() => {
                                      setConvToDelete(conv);
                                      setOpenConvMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete chat</span>
                                  </button>

                                  {/* Group-specific actions: Group Info, Exit group, Report group */}
                                  {conv.isGroup && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedGroupForInfo(conv);
                                          setOpenConvMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                                      >
                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Group info</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setGroupToExit(conv);
                                          setOpenConvMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                                      >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Exit group</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setGroupToReport(conv);
                                          setOpenConvMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Report group</span>
                                      </button>
                                    </>
                                  )}

                                  {/* 9. Block (shows Block or Block & Report) */}
                                  {!conv.isGroup && conv.participant.id !== currentUser.id && (
                                    <button
                                      onClick={() => {
                                        setBlockModalUser({ conv, user: conv.participant });
                                        setOpenConvMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      <span>Block</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>
                {isViewingArchivedSection
                  ? 'No archived chats'
                  : 'No conversations found'}
              </p>
              {isViewingArchivedSection && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Archived chats stay hidden from your main inbox.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Pane */}
      {activeConversation ? (
        <div
          className={`flex-1 flex flex-col bg-slate-50/60 dark:bg-slate-950 min-w-0 ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top Bar with Participant Info & Actions */}
          <div className="p-3 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                title="Back to conversations"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                onClick={() => {
                  if (activeConversation.isGroup) {
                    setSelectedGroupForInfo(activeConversation);
                  } else {
                    openUserProfile(activeConversation.participant.id);
                  }
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={activeConversation.groupAvatar || activeConversation.participant.avatar}
                    alt={activeConversation.groupName || activeConversation.participant.username}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition-colors"
                  />
                  {activeConversation.isGroup ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[8px] text-white">
                      👥
                    </span>
                  ) : activeConversation.participant.isOnline ? (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  ) : null}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    {activeConversation.groupName || activeConversation.participant.name}
                    {activeConversation.participant.id === SUPPORT_BOT_USER.id && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Bot
                      </span>
                    )}
                    {activeConversation.isGroup && (
                      <span className="text-[10px] font-normal text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-full">
                        {activeConversation.isGroupPublic ? 'Public' : 'Private'}
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {activeConversation.participant.id === SUPPORT_BOT_USER.id ? (
                      activeConversation.isTyping ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">generating answer...</span>
                      ) : (
                        'Automated Support & Privacy Guide • Always Online'
                      )
                    ) : activeConversation.isGroup ? (
                      `${(activeConversation.groupMembers || []).length} members • Click for info`
                    ) : activeConversation.isTyping ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">typing...</span>
                    ) : activeConversation.participant.isOnline ? (
                      'Active now'
                    ) : (
                      `@${activeConversation.participant.username}`
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => showToast('Voice calling is coming soon')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Audio Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => showToast('Video calling is coming soon')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (activeConversation.isGroup) {
                    setSelectedGroupForInfo(activeConversation);
                  } else {
                    openUserProfile(activeConversation.participant.id);
                  }
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={activeConversation.isGroup ? "View Group Details & Members" : "View Profile Details"}
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Chat Wallpapers & Themes Quick Button */}
              <button
                id="chat-header-wallpaper-btn"
                type="button"
                onClick={() => setShowWallpaperModal(true)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Chat Wallpaper & Themes (Gradients, Shapes, Sceneries, Device)"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Chat Header 3-dot dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setChatHeaderMenuOpen(!chatHeaderMenuOpen)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="More actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {chatHeaderMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setChatHeaderMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-30 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1 text-xs text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-700/60">
                      <div className="py-1">
                        {/* 1. Archive / Unarchive */}
                        <button
                          onClick={() => {
                            toggleArchiveConversation(activeConversation.id);
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>{activeConversation.isArchived ? 'Unarchive chat' : 'Archive chat'}</span>
                        </button>

                        {/* 2. Mute / Unmute */}
                        <button
                          onClick={() => {
                            toggleMuteConversation(activeConversation.id);
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          {activeConversation.isMuted ? (
                            <>
                              <Bell className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Unmute chat</span>
                            </>
                          ) : (
                            <>
                              <BellOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>Mute chat</span>
                            </>
                          )}
                        </button>

                        {/* 3. Pin / Unpin */}
                        <button
                          onClick={() => {
                            togglePinConversation(activeConversation.id);
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          {activeConversation.isPinned ? (
                            <>
                              <PinOff className="w-3.5 h-3.5 text-amber-500" />
                              <span>Unpin chat</span>
                            </>
                          ) : (
                            <>
                              <Pin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>Pin chat</span>
                            </>
                          )}
                        </button>

                        {/* 4. Hide / Unhide */}
                        <button
                          onClick={() => {
                            setChatHeaderMenuOpen(false);
                            if (activeConversation.isHiddenChat) {
                              unhideChat(activeConversation.id);
                            } else {
                              setHidingConversation({
                                id: activeConversation.id,
                                title: activeConversation.isGroup ? (activeConversation.groupName || 'Group') : activeConversation.participant.name
                              });
                              setShowEnterSecretCodeModal(true);
                            }
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          {activeConversation.isHiddenChat ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Unhide chat</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>Hide chat</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="py-1">
                        {/* 5. Add to list */}
                        <button
                          onClick={() => {
                            setListModalConv(activeConversation);
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Add to list</span>
                        </button>

                        {/* 6. Mark as unread / Mark as read */}
                        <button
                          onClick={() => {
                            if (activeConversation.unreadCount > 0) {
                              markConversationAsRead(activeConversation.id);
                              showToast(`Marked chat as read`);
                            } else {
                              markConversationAsUnread(activeConversation.id);
                              showToast(`Marked chat with ${activeConversation.participant.name} as unread`);
                            }
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          {activeConversation.unreadCount > 0 ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Mark as read</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>Mark as unread</span>
                            </>
                          )}
                        </button>

                        {/* Wallpaper & Themes */}
                        <button
                          id="header-wallpaper-menu-opt"
                          onClick={() => {
                            setChatHeaderMenuOpen(false);
                            setShowWallpaperModal(true);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                        >
                          <Palette className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Wallpaper & Themes</span>
                        </button>
                      </div>

                      {activeConversation.isGroup && (
                        <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            id="header-group-info-btn"
                            onClick={() => {
                              setSelectedGroupForInfo(activeConversation);
                              setChatHeaderMenuOpen(false);
                            }}
                            className="w-full px-3.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Group info</span>
                          </button>
                          <button
                            id="header-group-exit-btn"
                            onClick={() => {
                              setGroupToExit(activeConversation);
                              setChatHeaderMenuOpen(false);
                            }}
                            className="w-full px-3.5 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Exit group</span>
                          </button>
                          <button
                            id="header-group-report-btn"
                            onClick={() => {
                              setGroupToReport(activeConversation);
                              setChatHeaderMenuOpen(false);
                            }}
                            className="w-full px-3.5 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Report group</span>
                          </button>
                        </div>
                      )}

                      <div className="py-1">
                        {/* 7. Clear message */}
                        <button
                          id="chat-clear-messages-btn"
                          onClick={() => {
                            setConvToClear(activeConversation);
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 transition-colors"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          <span>Clear message</span>
                        </button>

                        {/* 8. Delete chat */}
                        <button
                          id="chat-delete-conv-btn"
                          onClick={() => {
                            setConvToDelete(activeConversation);
                            setChatHeaderMenuOpen(false);
                          }}
                          className="w-full px-3.5 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete chat</span>
                        </button>

                        {/* 9. Block (shows Block or Block & Report) */}
                        {!activeConversation.isGroup && activeConversation.participant.id !== currentUser.id && (
                          <button
                            id="chat-block-user-btn"
                            onClick={() => {
                              setBlockModalUser({ conv: activeConversation, user: activeConversation.participant });
                              setChatHeaderMenuOpen(false);
                            }}
                            className="w-full px-3.5 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Block</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-slate-950 transition-all duration-300"
            style={
              activeConversation.wallpaper
                ? activeConversation.wallpaper.type === 'gradient'
                  ? { background: activeConversation.wallpaper.value }
                  : activeConversation.wallpaper.type === 'shape'
                  ? {
                      backgroundImage: activeConversation.wallpaper.value,
                      backgroundRepeat: 'repeat',
                      backgroundSize: activeConversation.wallpaper.bgSize || '28px 28px'
                    }
                  : {
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${activeConversation.wallpaper.value})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }
                : undefined
            }
          >
            {/* Participant Profile Banner at Top of Thread */}
            <div className="text-center py-6 border-b border-slate-200/80 dark:border-slate-800 mb-4">
              <img
                src={activeConversation.participant.avatar}
                alt={activeConversation.participant.username}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-2 ring-2 ring-indigo-500/30"
              />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeConversation.participant.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{activeConversation.participant.username}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => openUserProfile(activeConversation.participant.id)}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs"
                >
                  View Profile
                </button>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">• Swipe message right to quote</span>
              </div>
            </div>

            {/* Message Stream */}
            {(() => {
              const userMessages = activeConversation.messages.filter(m => m.senderId === currentUser.id);
              const lastUserMessage = userMessages[userMessages.length - 1];

              return (
                <>
                  {activeConversation.messages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    const isLastUserMsg = isMe && lastUserMessage?.id === msg.id;
                    const isSeen = msg.status === 'seen' || Boolean(msg.seenAt) || (activeConversation.lastSeenByRecipient?.messageId === msg.id);
                    const isSelected = selectedMessageId === msg.id;
                    const senderName = isMe ? currentUser.name : activeConversation.participant.name;

                    return (
                      <div
                        key={msg.id}
                        id={`msg-container-${msg.id}`}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                      >
                        {/* Swipeable Message Bubble using Framer Motion */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 60 }}
                          dragElastic={0.2}
                          onDragEnd={(_, info) => {
                            if (info.offset.x > 35) {
                              setReplyingTo({
                                id: msg.id,
                                text: msg.isVoice ? '🎙️ Voice note' : msg.mediaUrl ? '📷 Media' : msg.text,
                                senderName
                              });
                              inputRef.current?.focus();
                            }
                          }}
                          className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${
                            isMe ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          {!isMe && (
                            <img
                              src={activeConversation.participant.avatar}
                              alt={activeConversation.participant.username}
                              className="w-7 h-7 rounded-full object-cover mb-1 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          )}

                          <div
                            onMouseDown={() => handleTouchStart(msg, senderName)}
                            onMouseUp={handleTouchEnd}
                            onTouchStart={() => handleTouchStart(msg, senderName)}
                            onTouchEnd={handleTouchEnd}
                            onClick={() => setSelectedMessageId(isSelected ? null : msg.id)}
                            className={`relative px-4 py-2.5 rounded-2xl text-xs leading-relaxed cursor-pointer transition-all duration-150 ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs hover:bg-indigo-700'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            {/* Quoted Message Card (if this message is a reply) */}
                            {msg.replyTo && (
                              <div className={`mb-2 p-1.5 px-2.5 rounded-lg border-l-2 text-[11px] ${
                                isMe
                                  ? 'bg-indigo-700/60 border-white text-indigo-100'
                                  : 'bg-slate-100 dark:bg-slate-900/80 border-indigo-500 text-slate-700 dark:text-slate-300'
                              }`}>
                                <p className={`font-semibold text-[10px] ${isMe ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                  {msg.replyTo.senderName}
                                </p>
                                <p className="truncate opacity-90">{msg.replyTo.text}</p>
                              </div>
                            )}

                            {/* Voice Note Bubble */}
                            {Boolean(
                              msg.documentData ||
                              msg.audioData ||
                              msg.contactData ||
                              msg.locationData ||
                              msg.pollData ||
                              msg.gameSession
                            ) ? (
                              <div className="space-y-1.5 min-w-[240px] max-w-[320px]">
                                <ChatMessageAttachment
                                  message={msg}
                                  isCurrentUser={isMe}
                                  currentUserId={currentUser.id}
                                  onUpdatePollVote={(mId, oId) => votePoll(activeConversation.id, mId, oId)}
                                  onUpdateGameSession={(mId, updated) => updateGameSession(activeConversation.id, mId, updated)}
                                  onStartChatWithUser={uid => {
                                    const foundUser = allUsers?.find(u => u.id === uid);
                                    if (foundUser) {
                                      startConversationWithUser(foundUser);
                                    } else {
                                      startConversationWithUser({
                                        id: uid,
                                        username: uid,
                                        name: 'Contact',
                                        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(uid)}`
                                      });
                                    }
                                  }}
                                />
                                {msg.text &&
                                  !msg.text.startsWith('🎮 Game:') &&
                                  !msg.text.startsWith('📊 Poll:') &&
                                  !msg.text.startsWith('📍 Location:') &&
                                  !msg.text.startsWith('👤 Contact:') &&
                                  !msg.text.startsWith('🎵 ') &&
                                  !msg.text.startsWith('📄 ') && (
                                    <div className="break-words mt-1 text-xs">
                                      <FormattedText text={msg.text} />
                                    </div>
                                  )}
                              </div>
                            ) : msg.isVoice ? (
                              <VoiceNotePlayer
                                durationSeconds={msg.voiceDurationSeconds || 6}
                                isSender={isMe}
                              />
                            ) : msg.mediaUrl ? (
                              /* Media Message */
                              <div className="space-y-1.5 max-w-[280px]">
                                {msg.mediaType === 'video' ? (
                                  <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                                    <img src={msg.mediaUrl} alt="Video preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <Film className="w-7 h-7 text-white" />
                                    </div>
                                  </div>
                                ) : msg.mediaType === 'file' ? (
                                  <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                                    isMe
                                      ? 'bg-indigo-700/60 border-indigo-500/50'
                                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                  }`}>
                                    <FileText className={`w-5 h-5 shrink-0 ${isMe ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`} />
                                    <span className="truncate text-[11px] font-medium">{msg.fileName || 'Attached file'}</span>
                                  </div>
                                ) : (
                                  <img
                                    src={msg.mediaUrl}
                                    alt="Shared asset"
                                    className="rounded-xl object-cover max-h-60 w-full border border-slate-200 dark:border-slate-700"
                                  />
                                )}
                                {msg.text && (
                                  <div className="break-words mt-1">
                                    <FormattedText text={msg.text} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Regular Text */
                              <div className="break-words">
                                <FormattedText text={msg.text} />
                                {msg.supportBotData && (
                                  <SupportBotActionButtons
                                    actions={msg.supportBotData.suggestedActions}
                                    quickReplies={msg.supportBotData.quickReplies}
                                    onQuickReplyClick={(prompt) => {
                                      sendMessage(activeConversation.id, prompt);
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            {/* Timestamp & Status Icon */}
                            <div
                              className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                                isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span className="inline-flex items-center">
                                  {isSeen ? (
                                    <CheckCheck className="w-3 h-3 text-indigo-100" title="Seen" />
                                  ) : msg.status === 'delivered' ? (
                                    <CheckCheck className="w-3 h-3 text-indigo-300" title="Delivered" />
                                  ) : msg.status === 'sending' ? (
                                    <Clock className="w-2.5 h-2.5 text-indigo-300 animate-spin" title="Sending..." />
                                  ) : (
                                    <Check className="w-3 h-3 text-indigo-300" title="Sent" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Reply Button (desktop hover or swipe shortcut) */}
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo({
                                id: msg.id,
                                text: msg.isVoice ? '🎙️ Voice note' : msg.mediaUrl ? '📷 Media' : msg.text,
                                senderName
                              });
                              inputRef.current?.focus();
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs"
                            title="Reply to message"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>

                        {/* Detailed timestamp sub-label when tapped */}
                        {isSelected && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1 flex items-center gap-2 animate-in fade-in duration-150">
                            <span>Sent at {msg.timestamp}</span>
                            {isMe && isSeen && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                • Seen by {activeConversation.participant.name}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo({
                                  id: msg.id,
                                  text: msg.isVoice ? '🎙️ Voice note' : msg.mediaUrl ? '📷 Media' : msg.text,
                                  senderName
                                });
                                inputRef.current?.focus();
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                            >
                              Quote reply
                            </button>
                          </div>
                        )}

                        {/* Direct Message Visual 'Seen' Indicator on the latest sent message */}
                        {isLastUserMsg && (
                          <div className="mt-1 select-none pr-1">
                            {isSeen ? (
                              <div
                                id={`seen-indicator-${msg.id}`}
                                className="flex items-center justify-end gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 animate-in fade-in duration-200"
                              >
                                <span className="font-normal">
                                  Seen{msg.seenAt ? ` ${msg.seenAt}` : ''}
                                </span>
                                <img
                                  src={activeConversation.participant.avatar}
                                  alt={activeConversation.participant.name}
                                  className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-indigo-500/40"
                                  title={`Seen by ${activeConversation.participant.name}`}
                                />
                              </div>
                            ) : msg.status === 'delivered' ? (
                              <div
                                id={`delivered-indicator-${msg.id}`}
                                className="flex items-center justify-end gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-normal"
                              >
                                <CheckCheck className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                <span>Delivered</span>
                              </div>
                            ) : (
                              <div
                                id={`sent-indicator-${msg.id}`}
                                className="flex items-center justify-end gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-normal"
                              >
                                <Check className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                <span>Sent</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator with 3 animated bouncing dots */}
                  {activeConversation.isTyping && (
                    <div className="flex items-end gap-2 justify-start animate-in fade-in duration-200 pt-1">
                      <img
                        src={activeConversation.participant.avatar}
                        alt={activeConversation.participant.username}
                        className="w-7 h-7 rounded-full object-cover mb-1 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-2 shadow-xs">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-1">
                          {activeConversation.participant.name} is typing...
                        </span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Pill Composer Area */}
          <div className="p-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
            {/* Replying To Quote Banner */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center justify-between p-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-l-4 border-indigo-600 border-y border-r border-slate-200 dark:border-slate-700 text-xs shadow-xs"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Replying to {replyingTo.senderName}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300 text-xs">{replyingTo.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active conversation scheduled messages banner */}
            {(() => {
              const activeScheduled = scheduledMessages.filter(
                m => m.conversationId === activeConversation?.id && m.scheduledForMs > Date.now()
              );
              if (activeScheduled.length === 0) return null;
              return (
                <div className="mb-2 space-y-1.5 animate-in fade-in duration-150">
                  {activeScheduled.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
                        <span className="font-semibold text-[11px] text-indigo-600 dark:text-indigo-400 shrink-0">
                          {new Date(item.scheduledForMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}:
                        </span>
                        <span className="truncate text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          "{item.text}"
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelScheduledMessage(item.id)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-semibold px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* In-Composer Active Voice Recording State */}
            {isRecording ? (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-indigo-500/50 shadow-md animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {formatTimer(recordingSeconds)}
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    <span className="w-1 h-5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" style={{ animationDelay: '100ms' }} />
                    <span className="w-1 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                    <span className="w-1 h-6 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" style={{ animationDelay: '50ms' }} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="p-1.5 rounded-full text-slate-500 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Cancel voice note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishAndSendVoice}
                    className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              </div>
            ) : (() => {
              const isGroup = Boolean(activeConversation?.isGroup);
              const isGroupOwner = isGroup && activeConversation.ownerId === currentUser.id;
              const isGroupAdmin = isGroup && (
                isGroupOwner ||
                (activeConversation.adminIds && activeConversation.adminIds.includes(currentUser.id))
              );
              const isRestrictedMessenger = isGroup && (
                activeConversation.restrictedMessengerIds && activeConversation.restrictedMessengerIds.includes(currentUser.id)
              );
              const isAdminsOnlyMessaging = isGroup && activeConversation.groupMessagingPermission === 'admins_only';
              const isBlockedFromMessaging = isGroup && (isRestrictedMessenger || (isAdminsOnlyMessaging && !isGroupAdmin));

              if (isBlockedFromMessaging) {
                return (
                  <div className="p-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-center flex items-center justify-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                    {isRestrictedMessenger ? (
                      <>
                        <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                        <span>
                          <strong>Messaging Restricted:</strong> An admin has turned off your ability to send messages in this group.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 shrink-0">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                        <span>
                          <strong>Admins Only:</strong> Only group admins can send messages in this group.
                        </span>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <div className="relative">
                {/* Clean Attachment Menu */}
                <ChatAttachmentMenu
                  isOpen={showAttachmentMenu}
                  onClose={() => setShowAttachmentMenu(false)}
                  onSelectOption={handleSelectAttachmentOption}
                />

                {/* Real-time Emoji Blend Detection Banner */}
                {(() => {
                  const detected = detectEmojiBlendInText(inputText);
                  if (detected && dismissedChatBlendKey !== `${detected.blend.id}_${detected.match}`) {
                    return (
                      <div className="mb-2">
                        <EmojiBlendSuggestionBanner
                          blend={detected.blend}
                          onApplyBlend={blend => {
                            const token = formatBlendToken(blend);
                            setInputText(prev => prev.replace(detected.match, `${token} `));
                          }}
                          onOpenKitchen={() => setIsKitchenOpen(true)}
                          onDismiss={() => {
                            setDismissedChatBlendKey(`${detected.blend.id}_${detected.match}`);
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Floating Pill Composer */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 shadow-sm transition-all"
                >
                  {/* Media Attachment Picker */}
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(true)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Share photo, video, or document"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Emoji Kitchen Mixer */}
                  <button
                    type="button"
                    onClick={() => setIsKitchenOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                    title="Emoji Kitchen Lab"
                    aria-label="Emoji Kitchen"
                  >
                    🧪
                  </button>

                {/* Direct Message Input */}
                <input
                  ref={inputRef}
                  id="direct-message-input"
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Message ${activeConversation.participant.name}...`}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />

                {/* Right controls: Mic / Send / Heart */}
                {inputText.trim() ? (
                  <button
                    id="direct-message-send-btn"
                    type="submit"
                    className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-transform shadow-xs"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Voice Note Record Button */}
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Record Voice Note"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Paperclip Attachment Button */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(prev => !prev)}
                      className={`p-1.5 rounded-full transition-colors ${
                        showAttachmentMenu
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                          : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title="Attach Media, Documents, Music, Contact, Location, Poll, Games"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Quick Heart Reaction */}
                    <button
                      type="button"
                      onClick={handleSendHeart}
                      className="p-1.5 rounded-full text-rose-500 hover:scale-110 active:scale-95 transition-transform"
                      title="Send heart"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>
                )}
              </form>
            </div>
          );
        })()}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center text-slate-400 dark:text-slate-500 flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs">Select a conversation to start chatting</p>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + New Message
          </button>
        </div>
      )}

      {/* Media Attachment Modal */}
      {showMediaModal && activeConversation && (
        <MediaAttachmentModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onSend={handleSendMedia}
          recipientName={activeConversation.participant.name}
        />
      )}

      {/* New Chat / User Search & Group Creation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewChatTab('direct')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                    newChatTab === 'direct'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Direct Message
                </button>
                <button
                  onClick={() => setNewChatTab('group')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    newChatTab === 'group'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>New Group</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setUserSearchQuery('');
                  setGroupName('');
                  setGroupDescription('');
                  setSelectedGroupMembers([]);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newChatTab === 'direct' ? (
              <>
                {/* Search Input */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      autoFocus
                      value={userSearchQuery}
                      onChange={e => setUserSearchQuery(e.target.value)}
                      placeholder="Search user by name or @username..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
                  {searchableUsers.length > 0 ? (
                    searchableUsers.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleStartNewChat(user)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <button
                          className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                        >
                          Chat
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      No users found matching "{userSearchQuery}"
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Group Chat Creation View */
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="e.g. Street Photographers Guild, Studio Team..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Group Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={groupDescription}
                    onChange={e => setGroupDescription(e.target.value)}
                    placeholder="Describe group purpose, topics, or community rules..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Group Privacy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupIsPublic(true)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        groupIsPublic
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold">Public Group</p>
                        <p className="text-[10px] text-slate-500">Anyone can join via link</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGroupIsPublic(false)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        !groupIsPublic
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold">Private Group</p>
                        <p className="text-[10px] text-slate-500">Admin approval required</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/50 text-[11px] text-indigo-950 dark:text-indigo-200 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Admin & Ownership Controls
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    As creator, you will be the group Owner with full control: appoint co-admins, approve join requests, manage messaging permissions, and configure privacy.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Members ({selectedGroupMembers.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-1">
                    {allUsers
                      .filter(u => u.id !== currentUser.id)
                      .map(user => {
                        const isSelected = selectedGroupMembers.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedGroupMembers(prev =>
                                isSelected
                                  ? prev.filter(id => id !== user.id)
                                  : [...prev, user.id]
                              );
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                {user.name} (@{user.username})
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="accent-indigo-600 w-4 h-4 rounded pointer-events-none"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!groupName.trim()}
                    onClick={() => {
                      if (!groupName.trim()) return;
                      createGroupChat(groupName.trim(), groupIsPublic, selectedGroupMembers, undefined, groupDescription.trim());
                      setShowNewChatModal(false);
                      setGroupName('');
                      setGroupDescription('');
                      setSelectedGroupMembers([]);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Create Group Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secret Vault & Hidden Content Modals */}
      <HiddenVaultModal
        isOpen={showHiddenVaultModal}
        onClose={() => setShowHiddenVaultModal(false)}
        onSelectConversation={conv => {
          setActiveConvId(conv.id);
          setMobileShowChat(true);
        }}
        onChangeSecretCode={() => setShowChangeSecretCodeModal(true)}
      />

      <EnterSecretCodeModal
        isOpen={showEnterSecretCodeModal}
        conversationId={hidingConversation?.id || null}
        conversationTitle={hidingConversation?.title}
        onClose={() => {
          setShowEnterSecretCodeModal(false);
          setHidingConversation(null);
        }}
        onOpenForgotCode={() => {
          setShowEnterSecretCodeModal(false);
          setShowChangeSecretCodeModal(true);
        }}
      />

      <ChangeSecretCodeModal
        isOpen={showChangeSecretCodeModal}
        onClose={() => setShowChangeSecretCodeModal(false)}
      />
      {/* Emoji Kitchen Modal for Direct Messages */}
      {isKitchenOpen && (
        <EmojiKitchenModal
          isOpen={isKitchenOpen}
          onClose={() => setIsKitchenOpen(false)}
          onSelectBlend={(blend) => {
            const token = formatBlendToken(blend);
            setInputText(prev => (prev ? `${prev} ${token}` : token));
            setIsKitchenOpen(false);
          }}
          insertButtonLabel="Send Sticker"
        />
      )}

      {/* Games Selector Modal */}
      {activeConversation && (
        <GamesSelectorModal
          isOpen={showGamesModal}
          onClose={() => setShowGamesModal(false)}
          opponentName={activeConversation.participant.name}
          onSelectGame={handleSelectGame}
        />
      )}

      {/* Document Attachment Modal */}
      <DocumentAttachmentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onSendDocument={handleSendDocument}
      />

      {/* Music Attachment Modal */}
      <MusicAttachmentModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        onSendMusic={handleSendMusic}
      />

      {/* Contact Attachment Modal */}
      <ContactAttachmentModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSendContact={handleSendContact}
      />

      {/* Location Attachment Modal */}
      <LocationAttachmentModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSendLocation={handleSendLocation}
      />

      {/* Poll Create Modal */}
      <PollCreateModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSendPoll={handleSendPoll}
      />

      {/* Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onScheduleMessage={handleScheduleMessage}
        participantName={activeConversation?.participant?.name}
      />

      {/* Add to Custom List Modal */}
      <AddToListModal
        isOpen={Boolean(listModalConv)}
        onClose={() => setListModalConv(null)}
        conversation={listModalConv}
        chatLists={chatLists}
        onCreateList={createChatList}
        onDeleteList={deleteChatList}
        onToggleList={(convId, listId) => {
          toggleChatInList(convId, listId);
          if (listModalConv && listModalConv.id === convId) {
            const currentLists = listModalConv.listIds || [];
            const nextLists = currentLists.includes(listId)
              ? currentLists.filter(id => id !== listId)
              : [...currentLists, listId];
            setListModalConv({
              ...listModalConv,
              listIds: nextLists
            });
          }
        }}
      />

      {/* Block & Report User Modal */}
      <BlockUserModal
        isOpen={Boolean(blockModalUser)}
        onClose={() => setBlockModalUser(null)}
        user={blockModalUser?.user || null}
        onBlock={userId => {
          blockUser(userId);
          showToast(`Blocked @${blockModalUser?.user.username}`);
        }}
        onBlockAndReport={(userId, reason, details) => {
          blockAndReportUser(userId, reason, details);
          showToast(`Blocked and reported @${blockModalUser?.user.username}`);
        }}
      />

      {/* Clear Messages Confirmation Modal */}
      {convToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Eraser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear messages?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chat with {convToClear.participant.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All messages in this chat will be removed permanently. The conversation will remain in your list.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConvToClear(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearConversation(convToClear.id);
                  setConvToClear(null);
                  showToast('Conversation messages cleared');
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
              >
                Clear messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      {convToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete chat?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Delete conversation with {convToDelete.participant.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConvToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConversation(convToDelete.id);
                  const remaining = conversations.filter(c => c.id !== convToDelete.id);
                  if (remaining.length > 0 && activeConvId === convToDelete.id) {
                    setActiveConvId(remaining[0].id);
                  }
                  setConvToDelete(null);
                  showToast('Conversation deleted');
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Details & Member Administration Modal */}
      <GroupInfoModal
        conversation={
          selectedGroupForInfo
            ? conversations.find(c => c.id === selectedGroupForInfo.id) || selectedGroupForInfo
            : null
        }
        isOpen={Boolean(selectedGroupForInfo)}
        onClose={() => setSelectedGroupForInfo(null)}
      />

      {/* Exit Group Modal */}
      <ExitGroupModal
        conversation={groupToExit}
        isOpen={Boolean(groupToExit)}
        onClose={() => setGroupToExit(null)}
        onSuccess={() => {
          if (activeConversation?.id === groupToExit?.id) {
            const remaining = conversations.filter(c => c.id !== groupToExit?.id);
            if (remaining.length > 0) {
              setActiveConvId(remaining[0].id);
            }
          }
          setGroupToExit(null);
        }}
      />

      {/* Report Group Modal */}
      <ReportGroupModal
        conversation={groupToReport}
        isOpen={Boolean(groupToReport)}
        onClose={() => setGroupToReport(null)}
      />

      {/* Chat Wallpapers & Themes Customizer Modal */}
      <ChatWallpapersModal
        isOpen={showWallpaperModal}
        onClose={() => setShowWallpaperModal(false)}
        conversationId={activeConversation?.id}
      />
    </div>
  );
};
