// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  CheckCheck,
  ChevronDown,
  Sparkles,
  UserCheck,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    toggleFollowUser,
    followedUserIds,
    setSelectedPostForModal,
    openUserProfile,
    posts,
    currentUser,
    allUsers
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'like' | 'comment' | 'follow'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(15);

  // Auto-delete notifications older than 20 days
  const activeNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (notif.createdAt && Date.now() - notif.createdAt > TWENTY_DAYS_MS) {
        return false;
      }
      const dayMatch = notif.timestamp.match(/(\d+)\s*d/i);
      if (dayMatch && parseInt(dayMatch[1], 10) > 20) {
        return false;
      }
      return true;
    });
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return activeNotifications.filter(n => {
      if (filter === 'all') return true;
      return n.type === filter;
    });
  }, [activeNotifications, filter]);

  // First 15 notifications, load more on clicking "Read more"
  const displayedNotifications = filteredNotifications.slice(0, visibleCount);
  const hasMore = filteredNotifications.length > visibleCount;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.postPreviewUrl) {
      const post = posts.find(p => p.mediaUrls.includes(notif.postPreviewUrl!)) || posts[0];
      if (post) setSelectedPostForModal(post);
    }
  };

  // Recommended accounts to discover based strictly on real registered users
  const recommendedUsers = useMemo(() => {
    return allUsers.filter(u => u.id !== currentUser.id && !followedUserIds.includes(u.id)).slice(0, 6);
  }, [allUsers, currentUser.id, followedUserIds]);

  return (
    <div
      id="notifications-view"
      className="w-full max-w-xl mx-auto py-4 px-3 md:px-4 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Notifications
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Recent activity from the last 20 days
          </p>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'like', label: 'Likes' },
          { id: 'comment', label: 'Comments' },
          { id: 'follow', label: 'Follows' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setFilter(tab.id as any);
              setVisibleCount(15);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === tab.id
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-900 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800/80 overflow-hidden shadow-xs">
        {displayedNotifications.map(notif => {
          const isFollowingThisUser =
            followedUserIds.includes(notif.user.id) || notif.user.isFollowing;

          return (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center justify-between gap-3 py-3.5 px-3.5 transition-colors cursor-pointer ${
                !notif.isRead
                  ? 'bg-sky-50/40 dark:bg-sky-950/20'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* User avatar with indicator icon */}
                <div
                  className="relative"
                  onClick={e => {
                    e.stopPropagation();
                    openUserProfile(notif.user.id);
                  }}
                >
                  <img
                    src={notif.user.avatar}
                    alt={notif.user.username}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-800 border-2 border-white dark:border-neutral-950 flex items-center justify-center">
                    {notif.type === 'like' && <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />}
                    {notif.type === 'comment' && <MessageCircle className="w-2.5 h-2.5 text-sky-400" />}
                    {notif.type === 'follow' && <UserPlus className="w-2.5 h-2.5 text-emerald-400" />}
                    {notif.type === 'mention' && <AtSign className="w-2.5 h-2.5 text-amber-400" />}
                  </div>
                </div>

                {/* Text snippet */}
                <div className="text-xs text-neutral-900 dark:text-neutral-100 leading-snug">
                  <span
                    onClick={e => {
                      e.stopPropagation();
                      openUserProfile(notif.user.id);
                    }}
                    className="font-semibold mr-1 hover:underline cursor-pointer"
                  >
                    {notif.user.username}
                  </span>
                  {notif.type === 'like' && 'liked your post.'}
                  {notif.type === 'comment' && (notif.text || 'commented on your photo.')}
                  {notif.type === 'follow' && 'started following you.'}
                  {notif.type === 'mention' && (notif.text || 'mentioned you in a post.')}
                  <span className="text-neutral-400 dark:text-neutral-500 text-[11px] block mt-0.5">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {/* Action: Post thumbnail or Follow back */}
              <div>
                {notif.postPreviewUrl ? (
                  <img
                    src={notif.postPreviewUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800"
                  />
                ) : notif.type === 'follow' ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFollowUser(notif.user.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      isFollowingThisUser
                        ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                        : 'bg-sky-500 text-white hover:bg-sky-600'
                    }`}
                  >
                    {isFollowingThisUser ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Following
                      </>
                    ) : (
                      'Follow Back'
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="py-14 text-center text-neutral-400">
            <p className="text-sm font-semibold">No notifications</p>
            <p className="text-xs mt-1">Activity older than 20 days is automatically cleared.</p>
          </div>
        )}
      </div>

      {/* Read More button if more than 15 notifications */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setVisibleCount(prev => prev + 15)}
            className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            Read more ({filteredNotifications.length - visibleCount} older notifications)
          </button>
        </div>
      )}

      {/* Account Recommendations Section (Shown only if other real accounts exist) */}
      {recommendedUsers.length > 0 && (
        <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Suggested Accounts for You
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Explore more
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recommendedUsers.map(user => {
              const isFollowing = followedUserIds.includes(user.id) || user.isFollowing;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800/80 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    onClick={() => openUserProfile(user.id)}
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollowUser(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ml-2 ${
                      isFollowing
                        ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 shadow-xs'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

