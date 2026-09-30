// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useMemo } from 'react';
import { Search, Heart, MessageCircle, Film, Sparkles, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';

export const ExploreView: React.FC = () => {
  const { posts, setSelectedPostForModal, setIsGlobalSearchOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('For you');

  const categories = ['For you', 'Photography', 'Travel', 'Architecture', 'Food', 'Style', 'Nature'];

  // Explore items derived solely from real user media posts (images & videos only, no text posts)
  const allExploreItems = useMemo(() => {
    return posts.filter(
      p =>
        !p.isTextPost &&
        p.postType !== 'text' &&
        ((p.mediaUrls && p.mediaUrls.length > 0 && Boolean(p.mediaUrls[0])) || Boolean(p.videoUrl))
    );
  }, [posts]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allExploreItems.filter(item => {
      const matchesSearch =
        item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

      if (searchQuery.trim()) return matchesSearch;

      if (selectedCategory === 'For you') return true;
      return (
        item.caption.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    });
  }, [allExploreItems, searchQuery, selectedCategory]);

  return (
    <div id="explore-view" className="w-full max-w-4xl mx-auto py-4 px-2 md:px-4">
      {/* Integrated Search Bar with embedded Search Button */}
      <div className="mb-5 max-w-xl mx-auto">
        <div className="relative flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 shadow-2xs">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="explore-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setIsGlobalSearchOpen(true);
              }
            }}
            placeholder="Search accounts, hashtags, places, or explore posts..."
            className="w-full pl-10 pr-28 py-2.5 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          <div className="absolute right-1.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            ) : (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-200/70 dark:bg-slate-800">
                ⌘K
              </span>
            )}
            <button
              id="explore-open-global-search-btn"
              type="button"
              onClick={() => setIsGlobalSearchOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Open Global Search (accounts, tags, posts)"
            >
              <Search className="w-3 h-3 stroke-[2.5]" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat && !searchQuery
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-3">
        {filteredItems.map((item, idx) => {
          // Every 6th item can be large span-2 on desktop for that signature Yaawp explore bento aesthetic
          const isFeatured = idx % 6 === 1;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedPostForModal(item)}
              className={`group relative overflow-hidden bg-slate-900 rounded-sm md:rounded-lg cursor-pointer aspect-square ${
                isFeatured ? 'col-span-1 row-span-1 md:col-span-2 md:row-span-2 md:aspect-auto' : ''
              }`}
            >
              <img
                src={item.mediaUrls[0]}
                alt={item.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Reel indicator icon if featured or reel */}
              {isFeatured && (
                <div className="absolute top-2 right-2 text-white drop-shadow-md z-10">
                  <Film className="w-5 h-5 fill-white/80" />
                </div>
              )}

              {/* Hover Overlay with stats */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold text-sm">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-5 h-5 fill-white text-white" />
                  <span>{item.likesCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5 fill-white text-white" />
                  <span>{item.comments.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center text-slate-500">
          <Compass className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {searchQuery ? `No results found for "${searchQuery}"` : 'No posts to explore yet'}
          </p>
          <p className="text-xs mt-1 text-slate-400">
            {searchQuery ? 'Try searching for other keywords' : 'Share moments with the community to populate the explore grid'}
          </p>
        </div>
      )}
    </div>
  );
};
