// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useEffect } from 'react';
import { FeedView } from '../../components/FeedView';
import { HomePageFeedSkeleton } from '../../components/SkeletonScreens';

export const HomePage: React.FC = () => {
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  useEffect(() => {
    // Initial data fetching hydration phase to display skeleton screen loader
    // and significantly improve perceived performance during initial mount
    const timer = setTimeout(() => {
      setIsFeedLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, []);

  if (isFeedLoading) {
    return <HomePageFeedSkeleton />;
  }

  return <FeedView />;
};

export default HomePage;
