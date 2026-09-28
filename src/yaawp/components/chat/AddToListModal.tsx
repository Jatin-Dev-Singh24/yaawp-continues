import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Tag, Trash2, FolderPlus, Sparkles } from 'lucide-react';
import { ChatConversation, ChatCustomList } from '../../types';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ChatConversation | null;
  chatLists: ChatCustomList[];
  onCreateList: (name: string, color?: string, icon?: string) => ChatCustomList;
  onDeleteList: (listId: string) => void;
  onToggleList: (conversationId: string, listId: string) => void;
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500', ringClass: 'ring-indigo-500', textClass: 'text-indigo-600 dark:text-indigo-400', badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
  { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500', ringClass: 'ring-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { id: 'amber', label: 'Amber', bgClass: 'bg-amber-500', ringClass: 'ring-amber-500', textClass: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { id: 'rose', label: 'Rose', bgClass: 'bg-rose-500', ringClass: 'ring-rose-500', textClass: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { id: 'violet', label: 'Violet', bgClass: 'bg-violet-500', ringClass: 'ring-violet-500', textClass: 'text-violet-600 dark:text-violet-400', badgeBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800' },
  { id: 'sky', label: 'Sky', bgClass: 'bg-sky-500', ringClass: 'ring-sky-500', textClass: 'text-sky-600 dark:text-sky-400', badgeBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' },
];

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  conversation,
  chatLists,
  onCreateList,
  onDeleteList,
  onToggleList,
}) => {
  const [newListName, setNewListName] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !conversation) return null;

  const currentListIds = conversation.listIds || [];

  const handleCreateNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const created = onCreateList(newListName.trim(), selectedColor);
    // Automatically add this conversation to the newly created list
    onToggleList(conversation.id, created.id);
    setNewListName('');
    setIsCreating(false);
  };

  const participantName = conversation.isGroup
    ? conversation.groupName || 'Group'
    : conversation.participant.name;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Add to List
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                  Classify chat with <span className="font-medium text-slate-700 dark:text-slate-300">{participantName}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Custom Lists
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Can belong to multiple lists
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Chats added to lists can be filtered quickly using the tabs above your chat list. In "All", all chats remain visible.
              </p>
            </div>

            {/* List of Custom Lists with Checkboxes */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {chatLists.length > 0 ? (
                chatLists.map(list => {
                  const isChecked = currentListIds.includes(list.id);
                  const colorObj = COLOR_OPTIONS.find(c => c.id === list.color) || COLOR_OPTIONS[0];

                  return (
                    <div
                      key={list.id}
                      onClick={() => onToggleList(conversation.id, list.id)}
                      className={`group flex items-center justify-between p-2.5 px-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${colorObj.bgClass}`} />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {list.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Delete custom list button (only show on hover if not default or if desired) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete list "${list.name}"?`)) {
                              onDeleteList(list.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                          title="Delete list"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-750 text-xs text-slate-500">
                  No lists created yet. Create one below!
                </div>
              )}
            </div>

            {/* Create New List Section */}
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create new list</span>
              </button>
            ) : (
              <form onSubmit={handleCreateNewList} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    New List Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  placeholder="e.g. School, Family, Work, Tennis Club..."
                  autoFocus
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />

                {/* Color choices */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                    Label Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id)}
                        className={`w-5 h-5 rounded-full ${c.bgClass} flex items-center justify-center transition-transform ${
                          selectedColor === c.id ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={c.label}
                      >
                        {selectedColor === c.id && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newListName.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create & Add</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {currentListIds.length} {currentListIds.length === 1 ? 'list' : 'lists'} assigned
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
