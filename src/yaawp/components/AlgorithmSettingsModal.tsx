import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  VolumeX,
  Users,
  EyeOff,
  RotateCcw,
  Check,
  Plus,
  Shield,
  Tag,
  Flame,
  Clock,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AlgorithmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmSettingsModal: React.FC<AlgorithmSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    algorithmSettings,
    updateAlgorithmSettings,
    resetRecommendationProfile,
    feedSort,
    setFeedSort,
    allUsers,
    communities,
    showToast
  } = useApp();

  const [newMuteKeyword, setNewMuteKeyword] = useState('');

  if (!isOpen) return null;

  const handleAddMuteKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newMuteKeyword.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    if (!algorithmSettings.mutedTopics.includes(clean)) {
      updateAlgorithmSettings({
        mutedTopics: [...algorithmSettings.mutedTopics, clean]
      });
      showToast(`Muted topic #${clean}`);
    }
    setNewMuteKeyword('');
  };

  const handleRemoveMuteTopic = (topic: string) => {
    updateAlgorithmSettings({
      mutedTopics: algorithmSettings.mutedTopics.filter(t => t !== topic)
    });
    showToast(`Unmuted topic #${topic}`);
  };

  const handleRemoveMuteCommunity = (commId: string) => {
    updateAlgorithmSettings({
      mutedCommunityIds: algorithmSettings.mutedCommunityIds.filter(id => id !== commId)
    });
    showToast('Community unmuted');
  };

  const handleRemoveMuteUser = (userId: string) => {
    updateAlgorithmSettings({
      mutedUserIds: algorithmSettings.mutedUserIds.filter(id => id !== userId)
    });
    showToast('Creator unmuted');
  };

  return (
    <div
      id="algorithm-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Feed Algorithm & Tuning
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You control what influences your recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm text-slate-800 dark:text-slate-200">
          {/* Feed Ranking Principle */}
          <section className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ranking Philosophy
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFeedSort('chronological')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  feedSort === 'chronological'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {feedSort === 'chronological' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div className="font-semibold text-xs">Chronological</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Strict recency order</div>
              </button>

              <button
                type="button"
                onClick={() => setFeedSort('balanced')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  feedSort === 'balanced'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  {feedSort === 'balanced' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div className="font-semibold text-xs">For You (Smart)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Decayed affinity & quality</div>
              </button>

              <button
                type="button"
                onClick={() => setFeedSort('engagement')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  feedSort === 'engagement'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Flame className="w-4 h-4 text-indigo-500" />
                  {feedSort === 'engagement' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div className="font-semibold text-xs">Engagement</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Likes, comments, saves</div>
              </button>
            </div>
          </section>

          {/* Discovery Controls & Privacy */}
          <section className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Discovery Boundaries
            </label>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              {/* Stop seeing recommended strangers */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <EyeOff className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      Stop seeing recommended strangers
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Only show creators and communities you follow or interact with.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={algorithmSettings.stopStrangers}
                  onChange={e => updateAlgorithmSettings({ stopStrangers: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                />
              </div>

              {/* Separate friends content from discovery */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      Separate friends content from discovery
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Keeps personal circle updates distinct from wide exploratory posts.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={algorithmSettings.separateFriendsFromDiscovery}
                  onChange={e =>
                    updateAlgorithmSettings({ separateFriendsFromDiscovery: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          </section>

          {/* Muted Topics & Keywords */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Muted Topics & Keywords
              </label>
              <span className="text-xs text-slate-400">
                {algorithmSettings.mutedTopics.length} muted
              </span>
            </div>

            <form onSubmit={handleAddMuteKeyword} className="flex gap-2">
              <input
                type="text"
                value={newMuteKeyword}
                onChange={e => setNewMuteKeyword(e.target.value)}
                placeholder="e.g. politics, spoilers, filmscans"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newMuteKeyword.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Mute
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {algorithmSettings.mutedTopics.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No muted topics yet.</p>
              ) : (
                algorithmSettings.mutedTopics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  >
                    #{topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveMuteTopic(topic)}
                      className="hover:text-rose-900 dark:hover:text-white ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </section>

          {/* Muted Communities */}
          {algorithmSettings.mutedCommunityIds.length > 0 && (
            <section className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                Muted Communities
              </label>
              <div className="flex flex-wrap gap-1.5">
                {algorithmSettings.mutedCommunityIds.map(commId => {
                  const comm = communities.find(c => c.id === commId);
                  const name = comm?.name || commId;
                  return (
                    <span
                      key={commId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveMuteCommunity(commId)}
                        className="hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Muted People (Without Unfollowing) */}
          {algorithmSettings.mutedUserIds.length > 0 && (
            <section className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Muted From Recommendations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {algorithmSettings.mutedUserIds.map(userId => {
                  const user = allUsers.find(u => u.id === userId);
                  const username = user?.username || userId;
                  return (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      @{username}
                      <button
                        type="button"
                        onClick={() => handleRemoveMuteUser(userId)}
                        className="hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Learned Topic Affinities */}
          <section className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Your Active Topic Affinities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(algorithmSettings.topicAffinities || {}).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No affinities recorded yet. As you react and tap "More like this", topics appear here.
                </p>
              ) : (
                Object.entries(algorithmSettings.topicAffinities).map(([topic, weightVal]) => {
                  const weight = Number(weightVal) || 0;
                  return (
                    <span
                      key={topic}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        weight > 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      #{topic}
                      <span className="font-mono text-[10px] opacity-75">
                        {weight > 0 ? `+${weight}` : weight}
                      </span>
                    </span>
                  );
                })
              )}
            </div>
          </section>

          {/* Reset Recommendation Profile */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Reset recommendation profile
              </div>
              <div className="text-[11px] text-slate-400">
                Clear all learned affinities and restore default discovery
              </div>
            </div>
            <button
              type="button"
              onClick={resetRecommendationProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
