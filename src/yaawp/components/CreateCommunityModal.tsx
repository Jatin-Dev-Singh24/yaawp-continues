// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Globe, Lock, Sparkles, Image, Shield, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CreateCommunityModal: React.FC = () => {
  const { isCreateCommunityOpen, setIsCreateCommunityOpen, createCommunity } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Creative', 'Community']);
  const [ruleInput, setRuleInput] = useState('');
  const [rules, setRules] = useState<string[]>([
    'Be respectful and constructive',
    'Share original photography and creative assets',
    'No spam or unauthorized promotion'
  ]);
  const [avatar, setAvatar] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  if (!isCreateCommunityOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setRules([...rules, ruleInput.trim()]);
      setRuleInput('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCommunity({
      name: name.trim(),
      description: description.trim() || 'A new creative space on Lumina.',
      about: about.trim() || description.trim() || 'A welcoming community for artists and enthusiasts.',
      isPrivate,
      avatar,
      bannerUrl,
      topicTags: tags,
      rules
    });

    // Reset form
    setName('');
    setDescription('');
    setAbout('');
    setIsPrivate(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
                  Create New Community
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Form a collective for discussions, critique, and shared inspiration
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateCommunityOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Community Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Community Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Minimalist Architecture, Street Portraiture..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            {/* Short Tagline/Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Short Description / Tagline
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A one-sentence summary for your community card"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Privacy Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    !isPrivate
                      ? 'border-lime-500 bg-lime-500/10 text-slate-900 dark:text-white ring-1 ring-lime-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-xs">Public</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Anyone can view and instantly join without approval.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isPrivate
                      ? 'border-lime-500 bg-lime-500/10 text-slate-900 dark:text-white ring-1 ring-lime-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs">Private</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Requires invite link or moderator approval to join.
                  </p>
                </button>
              </div>
            </div>

            {/* Topic Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic Tags
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. Lighting, Cinema, 35mm"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-lime-500/10 text-lime-700 dark:text-lime-300 text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-lime-600 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Community Rules */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Community Guidelines & Rules
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={ruleInput}
                  onChange={e => setRuleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                  placeholder="Add a community guideline rule..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Add Rule
                </button>
              </div>
              <ul className="space-y-1.5">
                {rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span>
                      <strong className="text-slate-400 mr-1.5">{idx + 1}.</strong> {rule}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Presets (Avatar & Banner) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Banner URL
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateCommunityOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-zinc-950 text-xs font-bold shadow-sm transition-all"
              >
                Create Collective
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
