// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StoriesBar: React.FC = () => {
  const { stories, currentUser, setActiveStoryUserIndex, setIsCreateModalOpen, conversations } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exclude users whose chats are hidden (their stories appear in the Locked Chats column only)
  const hiddenUserIds = new Set(conversations.filter(c => c.isHiddenChat).map(c => c.participant.id));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const userHasStory = stories.some(s => s.user.id === currentUser.id);

  return (
    <div
      id="stories-bar-container"
      className="relative w-full max-w-[480px] md:max-w-xl mx-auto mb-6 group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs py-3.5 px-3 ambient-glow transition-all"
    >
      {/* Left Scroll Arrow */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll stories left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Stories list */}
      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-5 overflow-x-auto px-2 no-scrollbar scroll-smooth"
      >
        {/* Current User Story Circle */}
        <div className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer">
          <div
            onClick={() => {
              if (userHasStory) {
                const idx = stories.findIndex(s => s.user.id === currentUser.id);
                setActiveStoryUserIndex(idx !== -1 ? idx : 0);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="relative"
          >
            <div
              className={`w-16 h-16 rounded-full overflow-hidden p-[2px] transition-transform ${
                userHasStory
                  ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                  : 'ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
              }`}
            >
              <img
                src={currentUser.avatar}
                alt="Your story"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {!userHasStory && (
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[68px]">
            Your Story
          </span>
        </div>

        {/* Other Users' Stories */}
        {stories
          .filter(s => s.user.id !== currentUser.id && !hiddenUserIds.has(s.user.id))
          .map((story) => {
            const globalIndex = stories.findIndex(s => s.id === story.id);
            return (
              <div
                key={story.id}
                id={`story-item-${story.user.username}`}
                onClick={() => setActiveStoryUserIndex(globalIndex)}
                className={`flex flex-col items-center space-y-1 shrink-0 cursor-pointer group/item ${
                  story.seen ? 'opacity-80' : ''
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden p-[2px] transition-transform duration-200 group-hover/item:scale-105 ${
                    story.seen
                      ? 'ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                      : 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                  }`}
                >
                  <img
                    src={story.user.avatar}
                    alt={story.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[68px]">
                  {story.user.username}
                </span>
              </div>
            );
          })}
      </div>

      {/* Right Scroll Arrow */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll stories right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
