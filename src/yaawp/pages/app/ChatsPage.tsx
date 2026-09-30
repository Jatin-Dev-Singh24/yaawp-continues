// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { MessagesView } from '../../components/MessagesView';
import { ChatPasscodeLock } from '../../components/ChatPasscodeLock';
import { useApp } from '../../context/AppContext';

export const ChatsPage: React.FC = () => {
  const { isChatLocked, chatPasscode } = useApp();

  if (isChatLocked && chatPasscode) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <ChatPasscodeLock />
      </div>
    );
  }

  return <MessagesView key={isChatLocked ? 'locked' : 'unlocked'} />;
};

export default ChatsPage;

