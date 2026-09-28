import React, { useState, useRef } from 'react';
import { AudioData } from '../../types';
import { Music, Upload, X, Play, Pause, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMusic: (music: AudioData, caption?: string) => void;
}

export const MusicAttachmentModal: React.FC<MusicAttachmentModalProps> = ({
  isOpen,
  onClose,
  onSendMusic,
}) => {
  const [selectedMusic, setSelectedMusic] = useState<AudioData | null>(null);
  const [caption, setCaption] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        const music: AudioData = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Device Audio',
          duration: Math.round(audio.duration) || 120,
          audioUrl,
        };
        setSelectedMusic(music);
      };
    }
  };

  const togglePreview = () => {
    if (!selectedMusic) return;
    if (previewPlaying) {
      audioPlayerRef.current?.pause();
      setPreviewPlaying(false);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.src = selectedMusic.audioUrl;
      audioPlayerRef.current.play().then(() => {
        setPreviewPlaying(true);
      }).catch(() => {
        setPreviewPlaying(true);
      });
      audioPlayerRef.current.onended = () => setPreviewPlaying(false);
    }
  };

  const handleSend = () => {
    if (!selectedMusic) return;
    audioPlayerRef.current?.pause();
    onSendMusic(selectedMusic, caption.trim());
    setSelectedMusic(null);
    setCaption('');
    onClose();
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Share Audio from Device
              </h3>
              <p className="text-[11px] text-slate-500">
                MP3, WAV, AAC audio tracks & songs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioPlayerRef.current?.pause();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Audio Upload Trigger */}
          {selectedMusic ? (
            <div className="p-4 rounded-2xl border border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  {previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {selectedMusic.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {selectedMusic.artist} • {formatDuration(selectedMusic.duration)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioPlayerRef.current?.pause();
                  setSelectedMusic(null);
                  setPreviewPlaying(false);
                }}
                className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg"
                title="Remove audio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-amber-50/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose audio file from device
              </span>
              <span className="text-[10px] text-slate-400">MP3, WAV, M4A, OGG</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          {/* Optional Caption */}
          {selectedMusic && (
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Message note (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Add note for this track..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              audioPlayerRef.current?.pause();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!selectedMusic}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
          >
            Send Track
          </button>
        </div>
      </motion.div>
    </div>
  );
};
