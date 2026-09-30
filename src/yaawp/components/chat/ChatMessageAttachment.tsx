// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef } from 'react';
import { ChatMessage, PollData, GameSession } from '../../types';
import {
  FileText,
  Download,
  Music,
  Play,
  Pause,
  Volume2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Circle,
  FileCode,
  FileArchive,
  FileSpreadsheet,
} from 'lucide-react';
import { GameContainer } from './games/GameContainer';
import { useApp } from '../../context/AppContext';

interface ChatMessageAttachmentProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  currentUserId: string;
  onUpdatePollVote?: (messageId: string, optionId: string) => void;
  onUpdateGameSession?: (messageId: string, updated: Partial<GameSession>) => void;
  onStartChatWithUser?: (userId: string) => void;
}

export const ChatMessageAttachment: React.FC<ChatMessageAttachmentProps> = ({
  message,
  isCurrentUser,
  currentUserId,
  onUpdatePollVote,
  onUpdateGameSession,
  onStartChatWithUser,
}) => {
  const { showToast } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. GAME ATTACHMENT
  if (message.gameSession) {
    return (
      <div className="mt-2 w-full min-w-[260px] max-w-[320px]">
        <GameContainer
          gameSession={message.gameSession}
          currentUserId={currentUserId}
          onUpdateSession={updated => {
            onUpdateGameSession?.(message.id, updated);
          }}
        />
      </div>
    );
  }

  // 2. DOCUMENT ATTACHMENT
  if (message.documentData) {
    const doc = message.documentData;

    const handleDownload = () => {
      if (doc.fileUrl) {
        const a = document.createElement('a');
        a.href = doc.fileUrl;
        a.download = doc.fileName;
        a.click();
      } else {
        // Fallback simulate instant download
        const blob = new Blob([`Content of ${doc.fileName}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      showToast?.(`Downloading ${doc.fileName}`);
    };

    const getDocIcon = (fileName: string) => {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) {
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      }
      if (fileName.endsWith('.zip') || fileName.endsWith('.tar')) {
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      }
      if (fileName.endsWith('.json') || fileName.endsWith('.ts') || fileName.endsWith('.html')) {
        return <FileCode className="w-5 h-5 text-indigo-500" />;
      }
      return <FileText className="w-5 h-5 text-blue-500" />;
    };

    return (
      <div className="mt-2 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between gap-3 min-w-[240px] max-w-[300px] shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            {getDocIcon(doc.fileName)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {doc.fileName}
            </span>
            <span className="text-[10px] text-slate-500">
              {doc.fileSize} • {doc.fileType}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center shrink-0 transition-colors shadow-xs"
          title="Download File"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. AUDIO / MUSIC ATTACHMENT
  if (message.audioData) {
    const music = message.audioData;

    const togglePlay = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio(music.audioUrl);
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current && audioRef.current.duration) {
            setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        };
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
          setAudioProgress(0);
        };
      }

      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlayingAudio(true);
        }).catch(() => {
          setIsPlayingAudio(true);
        });
      }
    };

    return (
      <div className="mt-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex flex-col gap-2 min-w-[250px] max-w-[310px] shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {music.title}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {music.artist}
            </span>
          </div>
          <Music className="w-4 h-4 text-amber-500 shrink-0 opacity-70" />
        </div>

        {/* Animated Waveform Bars */}
        <div className="flex items-center gap-1 h-5 px-1">
          {Array.from({ length: 22 }).map((_, i) => {
            const isFilled = (i / 22) * 100 <= audioProgress;
            const heights = [30, 60, 45, 90, 75, 40, 80, 50, 95, 60, 40, 70, 85, 45, 65, 90, 50, 35, 75, 55, 40, 60];
            const h = heights[i % heights.length];
            return (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-full transition-all ${
                  isFilled
                    ? 'bg-amber-500'
                    : isPlayingAudio
                    ? 'bg-amber-200 dark:bg-amber-950/60 animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // 4. CONTACT ATTACHMENT
  if (message.contactData) {
    const contact = message.contactData;

    const handleSaveContact = () => {
      showToast?.(`Saved ${contact.name} to contacts!`);
    };

    return (
      <div className="mt-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex flex-col gap-2.5 min-w-[240px] max-w-[280px] shadow-xs">
        <div className="flex items-center gap-3">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {contact.name}
            </span>
            {contact.phone && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                <Phone className="w-2.5 h-2.5" />
                {contact.phone}
              </span>
            )}
            {contact.email && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                <Mail className="w-2.5 h-2.5" />
                {contact.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
          {contact.id && onStartChatWithUser && (
            <button
              type="button"
              onClick={() => onStartChatWithUser(contact.id!)}
              className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] text-center transition-colors"
            >
              Message
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveContact}
            className="flex-1 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium text-[11px] text-center transition-colors"
          >
            Save Card
          </button>
        </div>
      </div>
    );
  }

  // 5. LOCATION ATTACHMENT
  if (message.locationData) {
    const loc = message.locationData;

    const openInMaps = () => {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${loc.latitude},${loc.longitude}`
      )}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
      <div className="mt-2 rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 min-w-[250px] max-w-[300px] shadow-xs">
        {/* Map Preview Placeholder Visual */}
        <div className="h-24 bg-gradient-to-br from-rose-100 via-amber-50 to-emerald-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 relative flex items-center justify-center p-2">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-bounce">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-1 rounded">
            {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}
          </span>
        </div>

        {/* Place info */}
        <div className="p-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {loc.name}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {loc.address}
            </span>
          </div>

          <button
            type="button"
            onClick={openInMaps}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors shrink-0"
            title="Open in Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 6. POLL ATTACHMENT
  if (message.pollData) {
    const poll: PollData = message.pollData;

    const getVoters = (opt: any): string[] => {
      if (Array.isArray(opt.voters)) return opt.voters;
      if (Array.isArray(opt.votes)) return opt.votes;
      return [];
    };

    const getVoteCount = (opt: any): number => {
      if (typeof opt.votes === 'number') return opt.votes;
      if (Array.isArray(opt.votes)) return opt.votes.length;
      if (Array.isArray(opt.voters)) return opt.voters.length;
      return 0;
    };

    const hasVotedAny = poll.options.some(opt => getVoters(opt).includes(currentUserId));

    const handleVote = (optId: string) => {
      onUpdatePollVote?.(message.id, optId);
    };

    return (
      <div className="mt-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 min-w-[260px] max-w-[320px] shadow-xs flex flex-col gap-2.5">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {poll.question}
          </span>
          <span className="text-[10px] text-slate-500">
            {poll.isMultipleChoice ? 'Multiple choice' : 'Single choice'} • {poll.totalVotes} total votes
          </span>
        </div>

        {/* Poll Options */}
        <div className="space-y-1.5">
          {poll.options.map(opt => {
            const voters = getVoters(opt);
            const voteCount = getVoteCount(opt);
            const hasVotedThis = voters.includes(currentUserId);
            const percentage = poll.totalVotes > 0 ? Math.round((voteCount / poll.totalVotes) * 100) : 0;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleVote(opt.id)}
                className={`w-full p-2 rounded-xl relative overflow-hidden border text-left transition-all ${
                  hasVotedThis
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {/* Progress bar fill */}
                {poll.totalVotes > 0 && (
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`absolute inset-y-0 left-0 transition-all ${
                      hasVotedThis
                        ? 'bg-cyan-500/20 dark:bg-cyan-500/30'
                        : 'bg-slate-200/50 dark:bg-slate-700/50'
                    }`}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {hasVotedThis ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {opt.text}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    {percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
