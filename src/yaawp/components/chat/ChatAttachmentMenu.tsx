import React, { useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Music,
  UserCheck,
  MapPin,
  BarChart2,
  Gamepad2,
  Clock,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

export type AttachmentMenuOption =
  | 'media'
  | 'documents'
  | 'music'
  | 'contact'
  | 'location'
  | 'poll'
  | 'games'
  | 'schedule';

interface ChatAttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: AttachmentMenuOption) => void;
}

interface MenuItem {
  id: AttachmentMenuOption;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'media',
    title: 'Photos & Videos',
    subtitle: 'Share images & video clips',
    icon: ImageIcon,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'documents',
    title: 'Documents',
    subtitle: 'Share PDF, DOCX, files',
    icon: FileText,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'music',
    title: 'Music from device',
    subtitle: 'Share audio tracks & songs',
    icon: Music,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'contact',
    title: 'Contact',
    subtitle: 'Share friend or contact card',
    icon: UserCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'location',
    title: 'Location',
    subtitle: 'Share GPS pin or place',
    icon: MapPin,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'poll',
    title: 'Poll',
    subtitle: 'Create live vote in chat',
    icon: BarChart2,
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'games',
    title: 'Games',
    subtitle: 'Real-time multiplayer games',
    icon: Gamepad2,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'schedule',
    title: 'Schedule Message',
    subtitle: 'Send automatically at future time',
    icon: Clock,
    iconBg: 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

export const ChatAttachmentMenu: React.FC<ChatAttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute bottom-full right-4 sm:right-10 mb-2 z-40 w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
    >
      {/* Menu Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Add Attachment
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Menu Options Grid / List */}
      <div className="p-2 grid grid-cols-1 gap-1 max-h-[380px] overflow-y-auto">
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectOption(item.id);
                onClose();
              }}
              className="w-full px-2.5 py-2 rounded-xl flex items-center gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-left transition-colors group"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.iconBg} ${item.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
