import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Crown,
  Lock,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  MessageSquare,
  MessageSquareOff,
  MoreVertical,
  LogOut,
  AlertTriangle,
  Edit2,
  UserMinus,
  Search,
  Link as LinkIcon,
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatConversation, UserSummary } from '../types';

interface GroupInfoModalProps {
  conversation: ChatConversation | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenExitModal?: () => void;
  onOpenReportModal?: () => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  conversation,
  isOpen,
  onClose,
  onOpenExitModal,
  onOpenReportModal
}) => {
  const {
    currentUser,
    allUsers,
    updateGroupSettings,
    promoteGroupAdmin,
    demoteGroupAdmin,
    toggleGroupMemberMessaging,
    removeGroupMember,
    addGroupMember,
    approveGroupJoinRequest,
    rejectGroupJoinRequest,
    requestJoinGroupViaLink,
    showToast,
    openUserProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'settings' | 'requests'>('info');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);

  // Editing state for group title & description
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(
    conversation?.groupName || conversation?.participant?.name || ''
  );
  const [editDescription, setEditDescription] = useState(
    conversation?.groupDescription || 'Welcome to our group! Share ideas, discuss, and connect.'
  );

  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    if (conversation) {
      setEditName(conversation.groupName || conversation.participant?.name || '');
      setEditDescription(
        conversation.groupDescription || 'Welcome to our group! Share ideas, discuss, and connect.'
      );
    }
  }, [conversation?.id, conversation?.groupName, conversation?.groupDescription]);

  if (!isOpen || !conversation) return null;

  // Determine user permissions
  const isOwner = conversation.ownerId === currentUser.id;
  const isAdmin = isOwner || (conversation.adminIds && conversation.adminIds.includes(currentUser.id));
  const members = conversation.groupMembers || [];
  const pendingRequests = conversation.pendingJoinRequests || [];
  const restrictedMessengers = conversation.restrictedMessengerIds || [];
  const isPrivate = !conversation.isGroupPublic;
  const messagingPerm = conversation.groupMessagingPermission || 'all';

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const inviteLink = `https://connecthub.app/join/${conversation.inviteCode || conversation.id}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    showToast('Group invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveInfo = () => {
    if (!editName.trim()) {
      showToast('Group name cannot be empty');
      return;
    }
    updateGroupSettings(conversation.id, {
      name: editName.trim(),
      description: editDescription.trim()
    });
    setIsEditingInfo(false);
  };

  // Quick helper to simulate a friend attempting to join via the link
  const handleSimulateInviteLink = () => {
    const candidates = allUsers.filter(
      u => u.id !== currentUser.id && !members.some(m => m.id === u.id)
    );
    if (candidates.length === 0) {
      showToast('All available test users are already members!');
      return;
    }
    const randomUser = candidates[Math.floor(Math.random() * candidates.length)];
    requestJoinGroupViaLink(conversation.id, {
      id: randomUser.id,
      username: randomUser.username,
      name: randomUser.name,
      avatar: randomUser.avatar,
      isVerified: randomUser.isVerified
    });
  };

  return (
    <div
      id="group-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="group-info-modal-container"
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Group Details
                {isPrivate ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin ? 'You are an Admin of this group' : 'Member view'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Hero Info Banner */}
        <div className="px-5 py-4 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent dark:from-indigo-950/20 dark:via-transparent border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-start gap-4">
            <img
              src={conversation.groupAvatar || conversation.participant.avatar}
              alt={conversation.groupName || conversation.participant.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              {isEditingInfo ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Group name"
                    className="w-full px-3 py-1.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-indigo-400 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Group description..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveInfo}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingInfo(false)}
                      className="px-3 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {conversation.groupName || conversation.participant.name}
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={() => setIsEditingInfo(true)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit group name & description"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {conversation.groupDescription || 'No description provided.'}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {members.length} member{members.length === 1 ? '' : 's'}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      {(conversation.adminIds || []).length || 1} admin{((conversation.adminIds || []).length || 1) === 1 ? '' : 's'}
                    </span>
                    {isPrivate && isAdmin && pendingRequests.length > 0 && (
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <UserPlus className="w-3.5 h-3.5" />
                        {pendingRequests.length} join request{pendingRequests.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Members ({members.length})</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Controls</span>
            </button>
          )}
          {isAdmin && isPrivate && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Pending Requests</span>
              {pendingRequests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Description Block */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  About this Group
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {conversation.groupDescription || 'No description provided by admin.'}
                </p>
              </div>

              {/* Group Privacy & Join Rules Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  {isPrivate ? (
                    <Lock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Globe className="w-4 h-4 text-emerald-500" />
                  )}
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {isPrivate ? 'Private Group Membership' : 'Public Group Membership'}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  {isPrivate
                    ? 'In this private group, new members can only be manually added by an admin, or if joining via invite link, must be approved by an admin before entering.'
                    : 'This group is public. Anyone with the group link can join and participate immediately.'}
                </p>

                {/* Invite Link Box */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Group Invite Link
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                      {inviteLink}
                    </div>
                    <button
                      onClick={handleCopyInviteLink}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulate Link Join Demo Action */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Test the join workflow as an external contact:
                  </span>
                  <button
                    onClick={handleSimulateInviteLink}
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px]"
                  >
                    <Sparkles className="w-3 h-3" />
                    Simulate Link Request
                  </button>
                </div>
              </div>

              {/* Messaging Rules Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {messagingPerm === 'admins_only' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Messaging Permission
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {messagingPerm === 'admins_only'
                      ? 'Only appointed Group Admins can send messages and media.'
                      : 'All members can send messages in this group (unless individually restricted by an admin).'}
                  </p>
                </div>
              </div>

              {/* Danger Zone: Exit & Report */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  id="group-info-exit-btn"
                  onClick={() => {
                    onClose();
                    onOpenExitModal();
                  }}
                  className="w-full p-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Exit Group
                </button>

                <button
                  id="group-info-report-btn"
                  onClick={() => {
                    onClose();
                    onOpenReportModal();
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Group
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Search & Add Member */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={e => setMemberSearchQuery(e.target.value)}
                    placeholder="Search group members..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Member</span>
                  </button>
                )}
              </div>

              {/* Members List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(member => {
                    const isMemberOwner = member.id === conversation.ownerId;
                    const isMemberAdmin = (conversation.adminIds || []).includes(member.id) || isMemberOwner;
                    const isMemberRestricted = restrictedMessengers.includes(member.id);
                    const isCurrent = member.id === currentUser.id;

                    return (
                      <div
                        key={member.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div
                          onClick={() => openUserProfile(member.id)}
                          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                        >
                          <img
                            src={member.avatar}
                            alt={member.username}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition-colors"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {member.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                  You
                                </span>
                              )}
                              {isMemberOwner ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  <Crown className="w-2.5 h-2.5" /> Owner
                                </span>
                              ) : isMemberAdmin ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  <ShieldCheck className="w-2.5 h-2.5" /> Admin
                                </span>
                              ) : null}

                              {isMemberRestricted && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                  <MessageSquareOff className="w-2.5 h-2.5" /> Muted
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              @{member.username}
                            </p>
                          </div>
                        </div>

                        {/* Admin Action Menu for Member */}
                        {isAdmin && !isMemberOwner && member.id !== currentUser.id && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMemberMenuId(openMemberMenuId === member.id ? null : member.id)
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Member actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMemberMenuId === member.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setOpenMemberMenuId(null)}
                                />
                                <div className="absolute right-0 top-8 z-30 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 text-xs text-slate-700 dark:text-slate-200">
                                  {/* Appoint / Dismiss Admin */}
                                  {isMemberAdmin ? (
                                    <button
                                      onClick={() => {
                                        demoteGroupAdmin(conversation.id, member.id);
                                        setOpenMemberMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-amber-600 dark:text-amber-400"
                                    >
                                      <Shield className="w-3.5 h-3.5" />
                                      <span>Dismiss as Admin</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        promoteGroupAdmin(conversation.id, member.id);
                                        setOpenMemberMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      <span>Appoint as Admin</span>
                                    </button>
                                  )}

                                  {/* Allow / Disallow Messaging */}
                                  <button
                                    onClick={() => {
                                      toggleGroupMemberMessaging(conversation.id, member.id);
                                      setOpenMemberMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    {isMemberRestricted ? (
                                      <>
                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Allow Messaging</span>
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquareOff className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Disallow Messaging</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

                                  {/* Remove Member */}
                                  <button
                                    onClick={() => {
                                      removeGroupMember(conversation.id, member.id);
                                      setOpenMemberMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                    <span>Remove from Group</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No members match "{memberSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN CONTROLS */}
          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-5">
              {/* Privacy Setting: Public vs Private */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Group Privacy Type
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Controls whether anyone can discover & join, or if manual admin approval is needed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateGroupSettings(conversation.id, { isPublic: true })}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      conversation.isGroupPublic
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Public Group</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Anyone with the link can join and chat right away.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateGroupSettings(conversation.id, { isPublic: false })}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      !conversation.isGroupPublic
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Private Group</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Adding manually is required, or link joins require admin approval.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Messaging Permission Setting: All Members vs Only Admins */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Messaging Permission
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Decide who is allowed to post messages in this group.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateGroupSettings(conversation.id, { messagingPermission: 'all' })
                    }
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      messagingPerm === 'all'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">All Members</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Everyone can send text, voice notes, and media.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateGroupSettings(conversation.id, { messagingPermission: 'admins_only' })
                    }
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      messagingPerm === 'admins_only'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Only Admins</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Only appointed group admins can post. Ideal for announcements.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Admin Roles & Appointed Admins Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Group Admins & Authority
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Admins can change group settings, approve join requests, and moderate messages.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {members
                    .filter(m => (conversation.adminIds || []).includes(m.id) || m.id === conversation.ownerId)
                    .map(adminUser => (
                      <div key={adminUser.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={adminUser.avatar}
                            alt={adminUser.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {adminUser.name}
                              {adminUser.id === conversation.ownerId && (
                                <span className="text-[10px] text-amber-500 font-normal">
                                  (Group Creator & Owner)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">@{adminUser.username}</p>
                          </div>
                        </div>

                        {isOwner && adminUser.id !== currentUser.id && (
                          <button
                            onClick={() => demoteGroupAdmin(conversation.id, adminUser.id)}
                            className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            Dismiss Admin
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PENDING JOIN REQUESTS (Private group admin approval) */}
          {activeTab === 'requests' && isAdmin && isPrivate && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Private Group Gatekeeping
                </p>
                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                  Because this group is private, people who access the invite link must request to join. As an admin, you can approve or decline their access.
                </p>
              </div>

              {pendingRequests.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  {pendingRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.user.avatar}
                          alt={req.user.username}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {req.user.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            @{req.user.username} • Requested {req.requestedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveGroupJoinRequest(conversation.id, req.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectGroupJoinRequest(conversation.id, req.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <UserPlus className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p>No pending join requests.</p>
                  <button
                    onClick={handleSimulateInviteLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Simulate a join request from a test user
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {isOwner ? 'You own and created this group' : isAdmin ? 'You are a group admin' : 'Standard member'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Nested Add Member Picker Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-500" />
                Add Member to Group
              </h4>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a friend or user to add directly into this group:
            </p>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
              {allUsers
                .filter(u => !members.some(m => m.id === u.id))
                .map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      addGroupMember(conversation.id, user.id);
                      setShowAddMemberModal(false);
                    }}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400">@{user.username}</p>
                      </div>
                    </div>
                    <button className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                      Add
                    </button>
                  </div>
                ))}
              {allUsers.filter(u => !members.some(m => m.id === u.id)).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  All available users are already in this group!
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
