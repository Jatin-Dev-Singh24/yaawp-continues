import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  Hash,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  ChevronRight,
  UserPlus,
  ArrowUpRight,
  Flame,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

const RECENT_SEARCHES_KEY = 'yaawp_recent_searches_v1';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    allUsers,
    posts,
    setSelectedPostForModal,
    openUserProfile,
    followedUserIds,
    toggleFollowUser,
    setActiveTab
  } = useApp();

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'tags' | 'posts'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Focus input on open
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveFilter('all');
    }
  }, [isGlobalSearchOpen]);

  // Global Keyboard shortcut: Cmd+K / Ctrl+K / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      } else if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save search history', err);
      }
      return next;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const next = prev.filter(t => t !== term);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // 1. Extract and index all hashtags across posts
  const allHashtags = useMemo(() => {
    const tagMap = new Map<string, number>();
    posts.forEach(p => {
      const matches = p.caption.match(/#[a-z0-9_]+/gi);
      if (matches) {
        matches.forEach(tag => {
          const lower = tag.toLowerCase();
          tagMap.set(lower, (tagMap.get(lower) || 0) + 1);
        });
      }
    });

    // Default top trending tags if none extracted
    const defaults: [string, number][] = [
      ['#minimalism', 24],
      ['#cyberpunk', 19],
      ['#cinematic', 15],
      ['#architecture', 12],
      ['#streetphotography', 10],
      ['#visualart', 8],
      ['#yaawp', 32]
    ];

    defaults.forEach(([dTag, count]) => {
      if (!tagMap.has(dTag)) {
        tagMap.set(dTag, count);
      }
    });

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  // 2. Filter Users
  const matchedUsers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().replace(/^@/, '');
    return allUsers.filter(
      u =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    );
  }, [allUsers, query]);

  // 3. Filter Hashtags
  const matchedHashtags = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().replace(/^#/, '');
    return allHashtags.filter(h => h.tag.toLowerCase().replace(/^#/, '').includes(q));
  }, [allHashtags, query]);

  // 4. Filter Posts
  const matchedPosts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return posts.filter(
      p =>
        p.caption.toLowerCase().includes(q) ||
        p.user.username.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
    );
  }, [posts, query]);

  const handleSelectUser = (user: UserProfile) => {
    saveRecentSearch(`@${user.username}`);
    setIsGlobalSearchOpen(false);
    openUserProfile(user.id);
    setActiveTab('profile');
    navigate('/app/profile');
  };

  const handleSelectPost = (post: Post) => {
    saveRecentSearch(query || post.caption.slice(0, 20));
    setIsGlobalSearchOpen(false);
    setSelectedPostForModal(post);
  };

  const handleSelectHashtag = (tag: string) => {
    saveRecentSearch(tag);
    setQuery(tag);
    setActiveFilter('posts');
  };

  if (!isGlobalSearchOpen) return null;

  const totalResults = matchedUsers.length + matchedHashtags.length + matchedPosts.length;
  const hasQuery = query.trim().length > 0;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsGlobalSearchOpen(false)}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                saveRecentSearch(query);
              }
            }}
            placeholder="Search creators, hashtags, captions, places..."
            className="flex-1 bg-transparent border-none text-sm md:text-base text-slate-900 dark:text-white placeholder:text-zinc-500 focus:outline-none"
            autoComplete="off"
          />
          {query ? (
            <button
              id="global-search-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/60">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {hasQuery && (
          <div className="px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-zinc-950/40">
            <button
              id="filter-search-all"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-lime-400 text-zinc-950 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              id="filter-search-users"
              onClick={() => setActiveFilter('users')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'users'
                  ? 'bg-lime-400 text-zinc-950 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Users ({matchedUsers.length})
            </button>
            <button
              id="filter-search-tags"
              onClick={() => setActiveFilter('tags')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'tags'
                  ? 'bg-lime-400 text-zinc-950 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              Hashtags ({matchedHashtags.length})
            </button>
            <button
              id="filter-search-posts"
              onClick={() => setActiveFilter('posts')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'posts'
                  ? 'bg-lime-400 text-zinc-950 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Posts ({matchedPosts.length})
            </button>
          </div>
        )}

        {/* Modal Body / Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[calc(85vh-130px)]">
          {!hasQuery ? (
            /* Idle State: Recent Searches & Trending Tags */
            <div className="space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-zinc-800/60">
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Recent Searches
                    </p>
                    <button
                      onClick={clearAllRecent}
                      className="text-xs text-rose-500 hover:text-rose-400 transition-colors font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {recentSearches.map(term => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          if (term.startsWith('#')) setActiveFilter('tags');
                          else if (term.startsWith('@')) setActiveFilter('users');
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-800 dark:text-zinc-200 cursor-pointer transition-colors"
                      >
                        <span>{term}</span>
                        <button
                          onClick={e => removeRecentSearch(term, e)}
                          className="text-zinc-400 hover:text-zinc-200 p-0.5"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Hashtags */}
              <div>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Trending on Yaawp
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allHashtags.slice(0, 6).map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => handleSelectHashtag(tag)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center font-bold text-xs">
                          #
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-lime-400 transition-colors">
                            {tag}
                          </p>
                          <p className="text-[10px] text-zinc-500">{count} posts</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-lime-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Creators */}
              <div>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Suggested Creators
                </p>
                <div className="space-y-2">
                  {allUsers.slice(0, 3).map(u => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {u.username}
                            </span>
                            {u.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 fill-lime-500 text-black" />
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                            {u.name} • {u.followersCount} followers
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFollowUser(u.id);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          followedUserIds.includes(u.id)
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            : 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                        }`}
                      >
                        {followedUserIds.includes(u.id) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : totalResults === 0 ? (
            /* No Results Found */
            <div className="py-12 text-center space-y-2">
              <Search className="w-10 h-10 text-zinc-400 mx-auto stroke-[1.5]" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No matches found for "{query}"
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Try searching for a creator handle, a hashtag like #minimalism, or a topic keyword.
              </p>
            </div>
          ) : (
            /* Matched Search Results */
            <div className="space-y-6">
              {/* Users Results */}
              {(activeFilter === 'all' || activeFilter === 'users') && matchedUsers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                    Users ({matchedUsers.length})
                  </p>
                  <div className="bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl divide-y divide-slate-200/60 dark:divide-zinc-800/60 overflow-hidden">
                    {matchedUsers.map(user => (
                      <div
                        key={user.id}
                        id={`search-user-${user.username}`}
                        onClick={() => handleSelectUser(user)}
                        className="p-3 px-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                @{user.username}
                              </p>
                              {user.isVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 fill-lime-500 text-black shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {user.name} • {user.followersCount} followers
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleFollowUser(user.id);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              followedUserIds.includes(user.id)
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                : 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                            }`}
                          >
                            {followedUserIds.includes(user.id) ? 'Following' : 'Follow'}
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags Results */}
              {(activeFilter === 'all' || activeFilter === 'tags') && matchedHashtags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                    Hashtags ({matchedHashtags.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedHashtags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        id={`search-tag-${tag.replace('#', '')}`}
                        onClick={() => handleSelectHashtag(tag)}
                        className="p-3 rounded-xl bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center font-bold text-xs">
                            #
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-lime-400 transition-colors">
                              {tag}
                            </p>
                            <p className="text-[10px] text-zinc-500">{count} posts</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-lime-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts / Trending Content Results */}
              {(activeFilter === 'all' || activeFilter === 'posts') && matchedPosts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                    Posts & Trending Media ({matchedPosts.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedPosts.map(post => (
                      <div
                        key={post.id}
                        id={`search-post-${post.id}`}
                        onClick={() => handleSelectPost(post)}
                        className="p-2.5 rounded-2xl bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex gap-3 cursor-pointer transition-colors group"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative">
                          <img
                            src={post.mediaUrls[0]}
                            alt={post.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                @{post.user.username}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-snug">
                              {post.caption}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500" />
                              {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.comments.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
