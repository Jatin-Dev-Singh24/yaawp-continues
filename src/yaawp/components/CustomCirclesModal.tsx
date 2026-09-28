import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Check,
  Search,
  Trash2,
  Sparkles,
  Shield,
  Heart,
  Home,
  GraduationCap,
  Gamepad2,
  MapPin,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomCircle } from '../types';

interface CustomCirclesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_OPTIONS = ['⭐', '💚', '🏠', '🎓', '🎮', '📍', '🎨', '🚀', '☕', '🎬'];

export const CustomCirclesModal: React.FC<CustomCirclesModalProps> = ({ isOpen, onClose }) => {
  const {
    customCircles,
    createCustomCircle,
    updateCustomCircle,
    deleteCustomCircle,
    toggleUserInCircle,
    activeCustomCircleId,
    setActiveCustomCircleId,
    setFeedMode,
    allUsers,
    currentUser,
    showToast
  } = useApp();

  const [selectedCircleId, setSelectedCircleId] = useState<string>(
    customCircles[0]?.id || 'circle_close_friends'
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleIcon, setNewCircleIcon] = useState('⭐');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const activeCircle = customCircles.find(c => c.id === selectedCircleId) || customCircles[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;
    createCustomCircle(newCircleName.trim(), newCircleIcon, []);
    setNewCircleName('');
    setIsCreatingNew(false);
  };

  const handleFilterFeedByCircle = (circleId: string) => {
    setActiveCustomCircleId(circleId);
    setFeedMode('custom_list');
    showToast(`Feed filtered to ${activeCircle?.name || 'circle'}`);
    onClose();
  };

  // Filter users to add/remove
  const filteredUsers = allUsers.filter(
    u =>
      u.id !== currentUser.id &&
      (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      id="custom-circles-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Custom Audience Circles
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Segment who sees your posts and filter your personal feeds
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

        {/* Modal Layout: 2 Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Circles List */}
          <div className="w-full md:w-60 border-r border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-850/40 flex flex-col gap-1 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Your Circles</span>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            {customCircles.map(circle => (
              <button
                key={circle.id}
                type="button"
                onClick={() => {
                  setSelectedCircleId(circle.id);
                  setIsCreatingNew(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  selectedCircleId === circle.id && !isCreatingNew
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{circle.icon}</span>
                  <span className="truncate">{circle.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  {circle.userIds.length}
                </span>
              </button>
            ))}

            {isCreatingNew && (
              <form onSubmit={handleCreateSubmit} className="mt-2 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">Create Circle</div>
                <div className="flex gap-1.5">
                  <select
                    value={newCircleIcon}
                    onChange={e => setNewCircleIcon(e.target.value)}
                    className="p-1 rounded bg-white dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700"
                  >
                    {ICON_OPTIONS.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newCircleName}
                    onChange={e => setNewCircleName(e.target.value)}
                    placeholder="Circle Name"
                    className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-2 py-1 text-[11px] text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCircleName.trim()}
                    className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Manage Members in Circle */}
          {activeCircle && (
            <div className="flex-1 p-5 flex flex-col overflow-hidden space-y-4">
              {/* Circle Info Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{activeCircle.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {activeCircle.name}
                      {activeCircle.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">{activeCircle.description || `${activeCircle.userIds.length} members`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFilterFeedByCircle(activeCircle.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Filter Feed
                  </button>
                  {!activeCircle.isDefault && (
                    <button
                      type="button"
                      onClick={() => deleteCustomCircle(activeCircle.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete circle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Member Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search creators to add or remove..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredUsers.map(user => {
                  const inCircle = activeCircle.userIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-400">@{user.username}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleUserInCircle(activeCircle.id, user.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          inCircle
                            ? 'bg-emerald-600 text-white hover:bg-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {inCircle ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!activeCircle && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Circles Created Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Create custom circles like Close Friends, Work, or Family to curate your feed.
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Create First Circle
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
