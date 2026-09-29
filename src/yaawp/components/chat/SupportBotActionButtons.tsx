import React from 'react';
import {
  Shield,
  Lock,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronRight,
  KeyRound,
  PlusSquare,
  Compass,
  User,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from '@/yaawp/compat/router';

interface SupportBotActionButtonsProps {
  actions?: {
    label: string;
    actionKey: 'open_privacy' | 'open_security' | 'open_secret_code' | 'open_permissions' | 'open_create_post' | 'explore_feed' | 'open_profile_edit';
    icon?: string;
  }[];
  quickReplies?: string[];
  onQuickReplyClick?: (reply: string) => void;
  onOpenSecretCodeModal?: () => void;
}

export const SupportBotActionButtons: React.FC<SupportBotActionButtonsProps> = ({
  actions,
  quickReplies,
  onQuickReplyClick,
  onOpenSecretCodeModal
}) => {
  const {
    setIsProfileMenuOpen,
    setIsSecurityModalOpen,
    resetAppPermissions,
    setIsCreateModalOpen,
    setIsEditProfileOpen,
    showToast
  } = useApp();
  const navigate = useNavigate();

  const handleAction = (actionKey: string) => {
    switch (actionKey) {
      case 'open_privacy':
        setIsProfileMenuOpen(true);
        showToast('Navigating to Privacy & Settings');
        break;
      case 'open_security':
        setIsSecurityModalOpen(true);
        break;
      case 'open_secret_code':
        if (onOpenSecretCodeModal) {
          onOpenSecretCodeModal();
        } else {
          setIsProfileMenuOpen(true);
        }
        break;
      case 'open_permissions':
        resetAppPermissions();
        showToast('Permissions reset to prompt Just-In-Time');
        break;
      case 'open_create_post':
        setIsCreateModalOpen(true);
        break;
      case 'explore_feed':
        navigate('/app');
        break;
      case 'open_profile_edit':
        setIsEditProfileOpen(true);
        break;
      default:
        break;
    }
  };

  const renderIcon = (key: string) => {
    switch (key) {
      case 'open_privacy':
        return <Shield className="w-3.5 h-3.5 text-indigo-500" />;
      case 'open_security':
        return <Lock className="w-3.5 h-3.5 text-emerald-500" />;
      case 'open_secret_code':
        return <KeyRound className="w-3.5 h-3.5 text-purple-500" />;
      case 'open_permissions':
        return <Sliders className="w-3.5 h-3.5 text-amber-500" />;
      case 'open_create_post':
        return <PlusSquare className="w-3.5 h-3.5 text-pink-500" />;
      case 'explore_feed':
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case 'open_profile_edit':
        return <User className="w-3.5 h-3.5 text-cyan-500" />;
      default:
        return <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="mt-3 space-y-2.5">
      {/* Deep-link Action Buttons */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {actions.map((act, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAction(act.actionKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs hover:bg-indigo-50/70 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
            >
              {renderIcon(act.actionKey)}
              <span>{act.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Suggested Quick Question Pills */}
      {quickReplies && quickReplies.length > 0 && onQuickReplyClick && (
        <div className="pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            <span>Suggested Questions:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickReplyClick(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
