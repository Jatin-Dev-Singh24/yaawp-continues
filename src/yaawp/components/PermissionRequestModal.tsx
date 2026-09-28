import React from 'react';
import { Camera, Mic, MapPin, FolderArchive, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PermissionRequestModal: React.FC = () => {
  const { activePermissionPrompt, respondToPermissionPrompt } = useApp();

  if (!activePermissionPrompt) return null;

  const { type, featureName } = activePermissionPrompt;

  const getPermissionDetails = () => {
    switch (type) {
      case 'camera':
        return {
          icon: Camera,
          iconBg: 'bg-emerald-500/10 text-emerald-500',
          title: 'Allow Yaawp to access your Camera?',
          desc: featureName
            ? `Needed for ${featureName}. You can take photos, record moments, and share visual stories.`
            : 'Needed to take photos, record moments, and share visual stories directly in Yaawp.'
        };
      case 'microphone':
        return {
          icon: Mic,
          iconBg: 'bg-indigo-500/10 text-indigo-500',
          title: 'Allow Yaawp to access your Microphone?',
          desc: featureName
            ? `Needed for ${featureName}. You can record voice notes and audio clips.`
            : 'Needed to record voice notes, voice messages in chats, and audio stories.'
        };
      case 'location':
        return {
          icon: MapPin,
          iconBg: 'bg-rose-500/10 text-rose-500',
          title: 'Allow Yaawp to access this device\'s Location?',
          desc: featureName
            ? `Needed for ${featureName}. You can share your live or pinned location.`
            : 'Needed to pinpoint your current location, tag places on posts, and share live location.'
        };
      case 'storage':
      default:
        return {
          icon: FolderArchive,
          iconBg: 'bg-amber-500/10 text-amber-500',
          title: 'Allow Yaawp to access Photos, Media, and Files?',
          desc: featureName
            ? `Needed for ${featureName}. You can select files from your device.`
            : 'Needed to attach photos, videos, and documents from your device gallery and storage.'
        };
    }
  };

  const details = getPermissionDetails();
  const Icon = details.icon;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="flex justify-center">
          <div className={`w-14 h-14 rounded-2xl ${details.iconBg} flex items-center justify-center shadow-inner`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {details.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-1">
            {details.desc}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            id="perm-allow-always-btn"
            onClick={() => respondToPermissionPrompt('always')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            While using the app (Always)
          </button>
          <button
            type="button"
            id="perm-allow-now-btn"
            onClick={() => respondToPermissionPrompt('now')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Only this time (For now only)
          </button>
          <button
            type="button"
            id="perm-deny-btn"
            onClick={() => respondToPermissionPrompt('deny')}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Don't allow (Deny)
          </button>
        </div>
      </div>
    </div>
  );
};
