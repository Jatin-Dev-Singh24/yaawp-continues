// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Sparkles, Clock, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CommunityJoinButtonProps {
  communityId: string;
  isJoined?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSparkleEffect?: boolean;
  className?: string;
  onJoinToggle?: (joined: boolean) => void;
}

export const CommunityJoinButton: React.FC<CommunityJoinButtonProps> = ({
  communityId,
  isJoined: propIsJoined,
  size = 'md',
  showSparkleEffect = true,
  className = '',
  onJoinToggle
}) => {
  const { communities, joinCommunity, joinRequests, currentUser, showToast } = useApp();
  const community = communities.find(c => c.id === communityId);
  const isJoined = propIsJoined !== undefined ? propIsJoined : (community?.isJoined ?? false);

  const isPending = !isJoined && Boolean(
    community?.isPrivate &&
    joinRequests.some(r => r.communityId === communityId && r.user.id === currentUser.id && r.status === 'pending')
  );

  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) {
      showToast('Your request is awaiting approval by community moderators.');
      return;
    }
    setIsAnimating(true);
    joinCommunity(communityId);
    if (onJoinToggle) {
      onJoinToggle(!isJoined);
    }
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3.5 py-1.5 text-xs gap-1.5',
    lg: 'px-5 py-2 text-sm gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.button
        id={`community-join-btn-${communityId}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.91 }}
        animate={
          isAnimating
            ? {
                scale: [1, 0.88, 1.08, 1],
                transition: { duration: 0.45, ease: 'easeOut' }
              }
            : { scale: 1 }
        }
        className={`relative overflow-hidden font-semibold rounded-full select-none cursor-pointer transition-colors duration-300 flex items-center justify-center ${
          sizeClasses[size]
        } ${
          isJoined
            ? isHovered
              ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs'
            : isPending
            ? 'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 shadow-xs'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-sm dark:bg-indigo-500 dark:hover:bg-indigo-600'
        } ${className}`}
        aria-label={isJoined ? 'Leave community' : isPending ? 'Pending Approval' : 'Join community'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isJoined ? (
            <motion.div
              key="joined"
              initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              {isHovered ? (
                <span>Leave</span>
              ) : (
                <>
                  <motion.span
                    animate={isAnimating ? { rotate: [0, -15, 15, 0], scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <Check className={`${iconSizes[size]} text-emerald-600 dark:text-emerald-400 stroke-[2.5]`} />
                  </motion.span>
                  <span>Member</span>
                </>
              )}
            </motion.div>
          ) : isPending ? (
            <motion.div
              key="pending"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              <Clock className={`${iconSizes[size]} text-amber-600 dark:text-amber-400 animate-spin-slow`} />
              <span>Pending</span>
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              {community?.isPrivate ? (
                <Lock className={`${iconSizes[size]} stroke-[2.5]`} />
              ) : (
                <Plus className={`${iconSizes[size]} stroke-[2.5]`} />
              )}
              <span>{community?.isPrivate ? 'Request' : 'Join'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle background pulse shine when tapped */}
        {isAnimating && (
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.55 }}
            className={`absolute inset-0 rounded-full pointer-events-none ${
              isJoined ? 'bg-emerald-400' : 'bg-indigo-400'
            }`}
          />
        )}
      </motion.button>

      {/* Micro-interaction Sparkle Burst for joining */}
      <AnimatePresence>
        {isAnimating && !isJoined && showSparkleEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-3 -right-2 pointer-events-none text-amber-400 flex items-center gap-0.5"
          >
            <Sparkles className="w-4 h-4 animate-pulse fill-amber-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
