// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { useApp } from '../context/AppContext';
import { AuthCard } from './auth/AuthCard';

export const CreateAccountModal: React.FC = () => {
  const {
    isCreateAccountModalOpen,
    setIsCreateAccountModalOpen,
    authModalMode
  } = useApp();

  if (!isCreateAccountModalOpen) return null;

  return (
    <div
      id="yaawp-auth-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      onClick={() => setIsCreateAccountModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Yaawp Authentication"
    >
      <AuthCard
        initialMode={authModalMode}
        isModal={true}
        onClose={() => setIsCreateAccountModalOpen(false)}
        onSuccess={() => setIsCreateAccountModalOpen(false)}
      />
    </div>
  );
};
