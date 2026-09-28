import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Check,
  ShieldCheck,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NearbyActivity } from '../types';

interface NearbyActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['All', 'Sports', 'Creative', 'Social', 'Tech', 'Outdoors'] as const;

export const NearbyActivitiesModal: React.FC<NearbyActivitiesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { nearbyActivities, joinNearbyActivity, createNearbyActivity, currentUser } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isHostingOpen, setIsHostingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Host Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'sports' | 'creative' | 'social' | 'tech' | 'outdoors'>('sports');
  const [locationName, setLocationName] = useState('');
  const [approxDistance, setApproxDistance] = useState('0.8 miles away');
  const [time, setTime] = useState('Today, 6:00 PM');
  const [maxSpots, setMaxSpots] = useState(6);

  if (!isOpen) return null;

  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) return;

    createNearbyActivity({
      title: title.trim(),
      description: description.trim(),
      category,
      locationName: locationName.trim(),
      approxDistance: approxDistance.trim() || 'Nearby',
      time: time.trim(),
      maxSpots: Number(maxSpots) || 8
    });

    setTitle('');
    setDescription('');
    setLocationName('');
    setIsHostingOpen(false);
  };

  const filteredActivities = nearbyActivities.filter(act => {
    const matchesCategory =
      selectedCategory === 'All' || act.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      id="nearby-activities-modal"
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
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Nearby Activities & Meetups
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Privacy-First
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                What are people around you doing that you might genuinely want to join?
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

        {/* Toolbar: Category filters & Host Button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search badminton, photowalk, sketch..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsHostingOpen(!isHostingOpen)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Host Activity
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Host Form Drawer */}
          {isHostingOpen && (
            <form
              onSubmit={handleHostSubmit}
              className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Host an Activity (No Exact GPS Required)
                </span>
                <button
                  type="button"
                  onClick={() => setIsHostingOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Activity Title (e.g., Casual Badminton Doubles)"
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="sports">Sports</option>
                  <option value="creative">Creative</option>
                  <option value="social">Social</option>
                  <option value="tech">Tech</option>
                  <option value="outdoors">Outdoors</option>
                </select>

                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="Neighborhood / Area (e.g. Yoyogi Sports Court)"
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="When? (e.g. Tomorrow 6:30 PM)"
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What should people know? (e.g. Bring your own racket, beginners welcome)"
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Max Spots:</span>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={maxSpots}
                    onChange={e => setMaxSpots(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs rounded border bg-white dark:bg-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Publish Meetup
                </button>
              </div>
            </form>
          )}

          {/* Activity Cards List */}
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No activities found</p>
              <p className="text-xs">Be the first to host a spontaneous meetup in your area!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredActivities.map(act => {
                const spotsLeft = act.maxSpots - act.spotsTaken;
                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {act.category}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {act.approxDistance}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {act.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2.5">
                        {act.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {act.locationName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {act.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Hosted by @{act.organizer.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      {/* Attendees Avatars */}
                      <div className="flex items-center -space-x-2">
                        {act.attendees.slice(0, 5).map(att => (
                          <img
                            key={att.id}
                            src={att.avatar}
                            alt={att.username}
                            title={att.name}
                            className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-850 object-cover"
                          />
                        ))}
                        {act.attendees.length > 5 && (
                          <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-850">
                            +{act.attendees.length - 5}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => joinNearbyActivity(act.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          act.isJoined
                            ? 'bg-emerald-600 text-white hover:bg-rose-600'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {act.isJoined ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Joined
                          </>
                        ) : (
                          'Join Activity'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center text-xs text-slate-400">
          <span>Approximate neighborhood locations only</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
