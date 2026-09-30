// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  durationSeconds?: number;
  isSender?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  durationSeconds = 6,
  isSender = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Pre-calculated pseudo random waveform bar heights (normalized 0.2 to 1.0)
  const barHeights = [
    0.35, 0.65, 0.4, 0.85, 0.7, 0.45, 0.9, 0.6, 0.75, 0.3,
    0.55, 0.95, 0.7, 0.4, 0.8, 0.6, 0.5, 0.85, 0.35, 0.6
  ];

  const totalTime = durationSeconds || 6;

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - (currentTime / speed) * 1000;

      const updateProgress = () => {
        if (!startTimeRef.current) return;
        const elapsed = (performance.now() - startTimeRef.current) / 1000 * speed;
        if (elapsed >= totalTime) {
          setCurrentTime(totalTime);
          setIsPlaying(false);
        } else {
          setCurrentTime(elapsed);
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, speed, totalTime]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= totalTime) {
        setCurrentTime(0);
      }
      setIsPlaying(true);
    }
  };

  const handleBarClick = (index: number) => {
    const fraction = index / barHeights.length;
    const newTime = fraction * totalTime;
    setCurrentTime(newTime);
    if (startTimeRef.current) {
      startTimeRef.current = performance.now() - (newTime / speed) * 1000;
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressFraction = Math.min(1, currentTime / totalTime);

  return (
    <div className="flex items-center gap-2.5 py-1 select-none min-w-[210px] sm:min-w-[240px]">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm ${
          isSender
            ? 'bg-white text-indigo-600 hover:bg-slate-100'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        title={isPlaying ? 'Pause' : 'Play voice note'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Visualization & Scrubber */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-[3px] h-7 cursor-pointer" title="Click to seek">
          {barHeights.map((h, i) => {
            const barFraction = (i + 0.5) / barHeights.length;
            const isFilled = progressFraction >= barFraction;
            return (
              <div
                key={i}
                onClick={() => handleBarClick(i)}
                className="flex-1 flex items-center justify-center h-full group"
              >
                <div
                  className={`w-full rounded-full transition-all duration-75 ${
                    isFilled
                      ? isSender
                        ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                        : 'bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_6px_rgba(79,70,229,0.5)]'
                      : isSender
                      ? 'bg-indigo-400/50 hover:bg-indigo-300/70'
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  style={{
                    height: `${Math.max(15, h * 100)}%`,
                    transform: isPlaying && isFilled ? 'scaleY(1.15)' : 'scaleY(1)'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Timestamp & Speed Multiplier */}
        <div
          className={`flex items-center justify-between text-[10px] font-mono tracking-tight ${
            isSender ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={cycleSpeed}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors ${
                isSender
                  ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Playback speed"
            >
              {speed}x
            </button>
            <Volume2 className={`w-3 h-3 ${isSender ? 'text-indigo-200' : 'text-slate-400'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
