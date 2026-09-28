import React from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CommunityJoinButton } from './CommunityJoinButton';

export const SuggestionsSidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    allUsers,
    setActiveTab,
    toggleFollowUser,
    followedUserIds,
    openUserProfile,
    setIsCreateAccountModalOpen,
    openLegalModal,
    communities
  } = useApp();

  const suggestedUsers = allUsers.filter(u => u.id !== currentUser.id).slice(0, 4);
  const featuredCommunities = communities.slice(0, 2);

  const handleOpenUser = (userId: string) => {
    openUserProfile(userId);
    setActiveTab('profile');
    navigate('/app/profile');
  };

  return (
    <aside
      id="desktop-suggestions-sidebar"
      className="hidden lg:block w-[320px] p-6 space-y-6 shrink-0"
      aria-label="Suggested Profiles"
    >
      {/* Current User Header */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => {
            openUserProfile(currentUser.id);
            setActiveTab('profile');
            navigate('/app/profile');
          }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:underline">
              {currentUser.username}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.name}
            </span>
          </div>
        </div>

        <button
          id="switch-account-btn"
          onClick={() => setIsCreateAccountModalOpen(true)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          title="Switch or Create Account"
        >
          Switch / Add
        </button>
      </div>

      {/* Suggestions Section - only displayed when other users exist */}
      {suggestedUsers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Suggestions for you
            </span>
            <button
              onClick={() => {
                setActiveTab('explore');
                navigate('/app/explore');
              }}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:opacity-75 transition-opacity"
            >
              See All
            </button>
          </div>

          {/* Suggested List */}
          <div className="space-y-4">
            {suggestedUsers.map(user => {
              const isFollowing = followedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  id={`suggested-user-${user.username}`}
                  className="flex items-center justify-between"
                >
                  <div
                    onClick={() => handleOpenUser(user.id)}
                    className="flex items-center space-x-3 min-w-0 cursor-pointer group"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-transparent group-hover:ring-indigo-400 transition-all"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px] group-hover:underline">
                        {user.username}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                        {user.bioSnippet || 'Suggested for you'}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`suggested-follow-${user.id}`}
                    onClick={() => toggleFollowUser(user.id)}
                    className={`text-xs font-bold transition-colors shrink-0 ${
                      isFollowing
                        ? 'text-slate-400 hover:text-rose-500'
                        : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700'
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

      {/* Suggested Communities - only displayed when communities exist */}
      {featuredCommunities.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5 text-indigo-500" />
              Top Communities
            </span>
            <button
              onClick={() => setActiveTab('communities')}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:opacity-75 transition-opacity"
            >
              Explore
            </button>
          </div>

          <div className="space-y-3">
            {featuredCommunities.map(comm => (
              <div
                key={comm.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 ambient-glow transition-all"
              >
                <div
                  onClick={() => setActiveTab('communities')}
                  className="flex items-center space-x-2.5 min-w-0 cursor-pointer group"
                >
                  <img
                    src={comm.avatar}
                    alt={comm.name}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px] group-hover:underline">
                      {comm.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {comm.membersCount.toLocaleString()} members
                    </span>
                  </div>
                </div>

                {/* Animated Join Button */}
                <CommunityJoinButton
                  communityId={comm.id}
                  isJoined={comm.isJoined}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Tags (High Density aesthetic) */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Trending Tags
        </span>
        <div className="flex flex-wrap gap-1.5">
          {['#photography', '#design', '#minimalism', '#tech', '#travel', '#architecture'].map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTab('explore')}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Yaawp Links Footer */}
      <div className="text-[10px] text-slate-400 dark:text-slate-600 leading-relaxed space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <button
            onClick={() => openLegalModal('privacy')}
            className="hover:underline cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            onClick={() => openLegalModal('terms')}
            className="hover:underline cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600"
          >
            Terms
          </button>
          <span>•</span>
          <button
            onClick={() => openLegalModal('cookies')}
            className="hover:underline cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600"
          >
            Cookies
          </button>
          <span>•</span>
          <button
            onClick={() => openLegalModal('community')}
            className="hover:underline cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600"
          >
            Guidelines
          </button>
          <span>•</span>
          <button
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="hover:underline cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            Create Account
          </button>
        </div>
        <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-600 tracking-wider">
          © 2026 YAAWP
        </p>
      </div>
    </aside>
  );
};
