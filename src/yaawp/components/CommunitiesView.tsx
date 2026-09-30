// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import {
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Compass,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Plus,
  KeyRound,
  EyeOff,
  MoreVertical,
  Flag,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommunityJoinButton } from './CommunityJoinButton';
import { CommunityDetailView } from './CommunityDetailView';
import { CreateCommunityModal } from './CreateCommunityModal';

export const CommunitiesView: React.FC = () => {
  const {
    communities,
    selectedCommunityId,
    setSelectedCommunityId,
    setIsCreateCommunityOpen,
    joinCommunity,
    toggleHideCommunity,
    reportCommunity,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'joined' | 'discover' | 'hidden'>('all');
  const [inviteCodeModalOpen, setInviteCodeModalOpen] = useState(false);
  const [enteredInviteCode, setEnteredInviteCode] = useState('');
  const [selectedInviteCommId, setSelectedInviteCommId] = useState<string | null>(null);

  // If a community is selected, render the Reddit-like detail view
  const activeCommunity = communities.find(c => c.id === selectedCommunityId);
  if (activeCommunity) {
    return (
      <CommunityDetailView
        community={activeCommunity}
        onBack={() => setSelectedCommunityId(null)}
      />
    );
  }

  const filteredCommunities = communities.filter(c => {
    // Filter by hidden state
    if (activeFilter === 'hidden') {
      return c.isHidden;
    }
    if (c.isHidden) {
      return false;
    }

    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topicTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'joined') return c.isJoined;
    if (activeFilter === 'discover') return !c.isJoined;
    return true;
  });

  const joinedCount = communities.filter(c => c.isJoined && !c.isHidden).length;
  const hiddenCount = communities.filter(c => c.isHidden).length;

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredInviteCode.trim() || !selectedInviteCommId) return;

    joinCommunity(selectedInviteCommId, enteredInviteCode.trim());
    setInviteCodeModalOpen(false);
    setEnteredInviteCode('');
    setSelectedInviteCommId(null);
  };

  return (
    <div id="communities-view" className="w-full max-w-5xl mx-auto py-6 px-3 md:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-lime-500/20 text-lime-400">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Creative Communities & Collectives
              </h1>
            </div>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Explore ongoing topics, share portfolios, upvote threads, and build focused creative networks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Create Community button - visible to everyone */}
            <button
              onClick={() => setIsCreateCommunityOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Community</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-lime-600 dark:text-lime-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Collectives
          </button>
          <button
            onClick={() => setActiveFilter('joined')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'joined'
                ? 'bg-white dark:bg-slate-800 text-lime-600 dark:text-lime-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Joined ({joinedCount})
          </button>
          <button
            onClick={() => setActiveFilter('discover')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'discover'
                ? 'bg-white dark:bg-slate-800 text-lime-600 dark:text-lime-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Discover
          </button>
          {hiddenCount > 0 && (
            <button
              onClick={() => setActiveFilter('hidden')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'hidden'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hidden ({hiddenCount})</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search communities, topics, tags..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-lime-500"
          />
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCommunities.map(community => (
          <article
            key={community.id}
            id={`community-card-${community.id}`}
            onClick={() => setSelectedCommunityId(community.id)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group"
          >
            {/* Banner Image */}
            <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={community.bannerUrl}
                alt={community.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                  {community.isPrivate ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-emerald-400" />
                      Public
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Avatar & Title Bar */}
                <div className="flex items-start justify-between gap-3 -mt-10 mb-3">
                  <div className="relative">
                    <img
                      src={community.avatar}
                      alt={community.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {community.isPrivate && !community.isJoined && (
                      <button
                        onClick={() => {
                          setSelectedInviteCommId(community.id);
                          setInviteCodeModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                        title="Enter secret invite code"
                      >
                        <KeyRound className="w-3 h-3 text-amber-500" />
                        <span>Code</span>
                      </button>
                    )}

                    <CommunityJoinButton
                      communityId={community.id}
                      isJoined={community.isJoined}
                      size="md"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 mb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {community.description}
                  </p>
                </div>

                {/* Topic Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {community.topicTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats & Threads Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-lime-500" />
                    {community.membersCount.toLocaleString()} members
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    Topics & Threads
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-lime-600 dark:text-lime-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <Compass className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {communities.length === 0 ? 'No communities yet' : 'No communities match your search'}
          </p>
          <p className="text-xs text-slate-500">
            {communities.length === 0
              ? 'Be the first to create a creative collective or niche enclave!'
              : 'Try a different keyword or create your own custom collective!'}
          </p>
          {communities.length === 0 ? (
            <button
              onClick={() => setIsCreateCommunityOpen(true)}
              className="px-4 py-2 rounded-xl bg-lime-500 text-zinc-950 text-xs font-bold hover:bg-lime-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Collective</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-lime-500 text-zinc-950 text-xs font-bold hover:bg-lime-400 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Global Modals for Communities */}
      <CreateCommunityModal />

      {/* Invite Code Input Modal */}
      {inviteCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Join with Invite Code</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enter the community invite code or VIP pass to join this private collective immediately without moderator review.
            </p>

            <form onSubmit={handleJoinWithCode} className="space-y-3">
              <input
                type="text"
                required
                value={enteredInviteCode}
                onChange={e => setEnteredInviteCode(e.target.value)}
                placeholder="e.g. collective-invite or VIP_INVITE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-lime-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteCodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 text-zinc-950 font-bold text-xs hover:bg-lime-400"
                >
                  Join Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
