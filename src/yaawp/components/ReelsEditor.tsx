import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Scissors,
  Music,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Film,
  Upload,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ReelAudioTrack } from '../types';
import { POPULAR_AUDIO_TRACKS, AUDIO_CATEGORIES, playSyntheticAudioPreview } from '../data/audioTracks';
import { FILTER_PRESETS } from '../data/mockData';

export interface ReelsEditorProps {
  initialVideoUrl?: string;
  initialVideoFile?: File | null;
  onClose: () => void;
  onPublish: (data: {
    videoUrl: string;
    videoFile?: File | null;
    caption: string;
    musicTitle: string;
    audioTrackId?: string;
    audioTrackUrl?: string;
    trimStart: number;
    trimEnd: number;
    duration: number;
    filterClass: string;
  }) => void;
}

export const ReelsEditor: React.FC<ReelsEditorProps> = ({
  initialVideoUrl,
  initialVideoFile,
  onClose,
  onPublish,
}) => {
  // Video Source State
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl || '');
  const [videoFile, setVideoFile] = useState<File | null>(initialVideoFile || null);
  const [duration, setDuration] = useState<number>(15);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoNaturalAspect, setVideoNaturalAspect] = useState<string>('9/16');

  // Trimming State (in seconds)
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(15);
  const [isDraggingHandle, setIsDraggingHandle] = useState<'start' | 'end' | 'playhead' | null>(null);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<'trim' | 'audio' | 'filter' | 'caption'>('trim');

  // Audio Selection State
  const [selectedTrack, setSelectedTrack] = useState<ReelAudioTrack | null>(null);
  const [audioCategory, setAudioCategory] = useState<string>('all');
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState<string | null>(null);
  const [originalAudioVolume, setOriginalAudioVolume] = useState<number>(100);
  const [musicVolume, setMusicVolume] = useState<number>(85);

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState<string>('filter-normal');

  // Metadata / Caption State
  const [caption, setCaption] = useState<string>('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const timelineBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update video src when initialVideoUrl changes
  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
    }
  }, [initialVideoUrl]);

  // Handle Video Metadata Loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        setDuration(dur);
        setTrimStart(0);
        // Default max clip duration for reels: 60s or total video length
        const maxReelLen = Math.min(60, dur);
        setTrimEnd(maxReelLen);
      }
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        const aspect = `${videoRef.current.videoWidth}/${videoRef.current.videoHeight}`;
        setVideoNaturalAspect(aspect);
      }
    }
  };

  // Keep playback looped within [trimStart, trimEnd]
  const handleTimeUpdate = () => {
    if (!videoRef.current || isDraggingHandle) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (time >= trimEnd) {
      videoRef.current.currentTime = trimStart;
      videoRef.current.play().catch(() => {});
    } else if (time < trimStart) {
      videoRef.current.currentTime = trimStart;
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= trimEnd || videoRef.current.currentTime < trimStart) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Timeline seeking and trim dragging
  const handleTimelinePointerDown = (type: 'start' | 'end' | 'playhead', e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingHandle(type);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleTimelinePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingHandle || !timelineBarRef.current || duration <= 0) return;
    const rect = timelineBarRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetSeconds = (clampedX / rect.width) * duration;

    if (isDraggingHandle === 'start') {
      // Must have at least 1.0 second between trimStart and trimEnd
      const newStart = Math.min(Math.max(0, targetSeconds), trimEnd - 1.0);
      setTrimStart(newStart);
      if (videoRef.current) {
        videoRef.current.currentTime = newStart;
        setCurrentTime(newStart);
      }
    } else if (isDraggingHandle === 'end') {
      const newEnd = Math.max(Math.min(duration, targetSeconds), trimStart + 1.0);
      setTrimEnd(newEnd);
      if (videoRef.current) {
        videoRef.current.currentTime = newEnd;
        setCurrentTime(newEnd);
      }
    } else if (isDraggingHandle === 'playhead') {
      const clampedSeek = Math.max(trimStart, Math.min(trimEnd, targetSeconds));
      setCurrentTime(clampedSeek);
      if (videoRef.current) {
        videoRef.current.currentTime = clampedSeek;
      }
    }
  }, [isDraggingHandle, duration, trimStart, trimEnd]);

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingHandle) {
      setIsDraggingHandle(null);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      if (videoRef.current && isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Format seconds into MM:SS.SS
  const formatTime = (secs: number) => {
    const s = Math.max(0, secs);
    const m = Math.floor(s / 60);
    const remainder = (s % 60).toFixed(1);
    const secStr = parseFloat(remainder) < 10 ? `0${remainder}` : remainder;
    return `${m}:${secStr}`;
  };

  // Handle local video upload
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoUrl(url);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  // Audio Preview Handling
  const handleToggleAudioPreview = (track: ReelAudioTrack) => {
    // If clicking same active playing preview, stop it
    if (isPlayingAudioPreview === track.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
      setIsPlayingAudioPreview(null);
      return;
    }

    // Stop current
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }

    setIsPlayingAudioPreview(track.id);

    try {
      const audio = new Audio(track.previewUrl);
      audio.volume = 0.7;
      audioPreviewRef.current = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocks audio load from remote CDN, use synthetic Web Audio synthesizer!
          const cleanup = playSyntheticAudioPreview(track.id, 6000);
          audioCleanupRef.current = cleanup;
        });
      }
      audio.onended = () => {
        setIsPlayingAudioPreview(null);
      };
    } catch {
      const cleanup = playSyntheticAudioPreview(track.id, 6000);
      audioCleanupRef.current = cleanup;
    }
  };

  const handleSelectAudioTrack = (track: ReelAudioTrack | null) => {
    setSelectedTrack(track);
    // Stop preview sound
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    setIsPlayingAudioPreview(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
      }
    };
  }, []);

  // Filter category list
  const filteredAudioTracks = POPULAR_AUDIO_TRACKS.filter(t => {
    if (audioCategory === 'all') return true;
    return t.category === audioCategory;
  });

  const clipDuration = Math.max(0.5, trimEnd - trimStart);

  // Final Publish Action
  const handlePublishClick = () => {
    if (!videoUrl) return;
    onPublish({
      videoUrl,
      videoFile,
      caption,
      musicTitle: selectedTrack ? `${selectedTrack.title} • ${selectedTrack.artist}` : 'Original Audio',
      audioTrackId: selectedTrack?.id,
      audioTrackUrl: selectedTrack?.previewUrl,
      trimStart,
      trimEnd,
      duration: clipDuration,
      filterClass: selectedFilter,
    });
  };

  return (
    <div
      id="reels-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800 shrink-0 bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Reels Studio & Clip Editor
              </h2>
              <p className="text-[11px] text-neutral-400">
                Trim clips, attach background music tracks, and polish short-form videos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reels-editor-cancel-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close Reels Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Work Area: Left Preview Viewport, Right Tool Controls */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* LEFT: Video Viewport Player */}
          <div className="w-full md:w-1/2 lg:w-5/12 bg-black flex flex-col items-center justify-center p-3 relative group shrink-0 select-none">
            {videoUrl ? (
              <div className="relative w-full max-w-[280px] h-[52vh] md:h-[62vh] max-h-[500px] aspect-9/16 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  autoPlay
                  loop
                  muted={isMuted}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  className={`w-full h-full object-cover cursor-pointer ${selectedFilter}`}
                  onClick={togglePlay}
                />

                {/* Play / Pause Centered Overlay on hover or when paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center justify-center hover:scale-105 transition-transform"
                    aria-label="Play video"
                  >
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </button>
                )}

                {/* Sound & Format Pill */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono backdrop-blur-xs border border-white/10 text-white/90">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="w-7 h-7 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center justify-center hover:bg-black/80 transition-colors pointer-events-auto"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Selected Sound Badge Overlaid at bottom */}
                {selectedTrack && (
                  <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-1.5 flex items-center gap-2 pointer-events-none">
                    <div className="w-6 h-6 rounded bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0">
                      <Music className="w-3 h-3 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-white truncate leading-tight">
                        {selectedTrack.title}
                      </p>
                      <p className="text-[9px] text-neutral-400 truncate">
                        {selectedTrack.artist}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No video uploaded yet - upload dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-[280px] h-[52vh] md:h-[62vh] max-h-[500px] aspect-9/16 rounded-xl border-2 border-dashed border-neutral-700 hover:border-lime-500/60 bg-neutral-900/60 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white mb-1">
                  Upload Reel Video
                </p>
                <p className="text-[11px] text-neutral-400 mb-4">
                  Select an MP4, WebM, or MOV video file to trim and edit
                </p>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-neutral-950 text-xs font-semibold"
                >
                  Choose File
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoFileSelect}
            />
          </div>

          {/* RIGHT: Tools & Controls Panel */}
          <div className="flex-1 flex flex-col bg-neutral-900 overflow-hidden border-t md:border-t-0 md:border-l border-neutral-800">
            {/* Tool Selection Tabs */}
            <div className="flex items-center gap-1 p-2 bg-neutral-950/40 border-b border-neutral-800 shrink-0">
              <button
                type="button"
                id="reels-tab-trim"
                onClick={() => setActiveTab('trim')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'trim'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-lime-400" />
                <span>Trim & Duration</span>
              </button>

              <button
                type="button"
                id="reels-tab-audio"
                onClick={() => setActiveTab('audio')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span>Audio Track</span>
                {selectedTrack && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 ml-0.5" />}
              </button>

              <button
                type="button"
                id="reels-tab-filter"
                onClick={() => setActiveTab('filter')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'filter'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Filters</span>
              </button>

              <button
                type="button"
                id="reels-tab-caption"
                onClick={() => setActiveTab('caption')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'caption'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Details</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: TRIM & CLIP LENGTH */}
              {activeTab === 'trim' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                        Precision Clip Trimmer
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Drag the green timeline handles to set start and end points
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTrimStart(0);
                        setTrimEnd(duration);
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                        }
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded bg-neutral-800/60"
                      title="Reset clip trimming"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Clip Stat Cards */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                        Start Point
                      </span>
                      <span className="text-sm font-mono font-medium text-lime-400">
                        {formatTime(trimStart)}s
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                        End Point
                      </span>
                      <span className="text-sm font-mono font-medium text-lime-400">
                        {formatTime(trimEnd)}s
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                        Clip Length
                      </span>
                      <span className="text-sm font-mono font-medium text-white">
                        {clipDuration.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Interactive Waveform / Timeline Slider */}
                  <div className="pt-2 pb-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Timeline: 0:00</span>
                      <span>Total: {formatTime(duration)}</span>
                    </div>

                    {/* Timeline Container */}
                    <div
                      ref={timelineBarRef}
                      onPointerMove={handleTimelinePointerMove}
                      onPointerUp={handleTimelinePointerUp}
                      className="relative h-14 bg-neutral-950 rounded-xl border border-neutral-800 select-none cursor-pointer overflow-hidden p-1"
                    >
                      {/* Simulated video frame thumbnails track in timeline */}
                      <div className="absolute inset-x-2 inset-y-2 flex items-center justify-between gap-1 opacity-20 pointer-events-none">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full bg-neutral-700 rounded-sm border border-neutral-600"
                          />
                        ))}
                      </div>

                      {/* Inactive Dimmed Left Region */}
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-black/75 z-10"
                        style={{ width: `${(trimStart / (duration || 1)) * 100}%` }}
                      />

                      {/* Active Trim Window */}
                      <div
                        className="absolute top-1 bottom-1 rounded-lg border-2 border-lime-400 bg-lime-400/10 z-15 pointer-events-none"
                        style={{
                          left: `${(trimStart / (duration || 1)) * 100}%`,
                          width: `${((trimEnd - trimStart) / (duration || 1)) * 100}%`
                        }}
                      />

                      {/* Inactive Dimmed Right Region */}
                      <div
                        className="absolute top-0 bottom-0 right-0 bg-black/75 z-10"
                        style={{ width: `${Math.max(0, 100 - (trimEnd / (duration || 1)) * 100)}%` }}
                      />

                      {/* Left Trim Handle */}
                      <div
                        onPointerDown={(e) => handleTimelinePointerDown('start', e)}
                        className="absolute top-0 bottom-0 w-4 -ml-2 bg-lime-400 hover:bg-lime-300 rounded-l-md flex items-center justify-center cursor-ew-resize z-20 shadow-lg active:scale-105 transition-transform"
                        style={{ left: `${(trimStart / (duration || 1)) * 100}%` }}
                        title="Drag to adjust start time"
                      >
                        <div className="w-0.5 h-4 bg-neutral-950 rounded-full" />
                      </div>

                      {/* Right Trim Handle */}
                      <div
                        onPointerDown={(e) => handleTimelinePointerDown('end', e)}
                        className="absolute top-0 bottom-0 w-4 -ml-2 bg-lime-400 hover:bg-lime-300 rounded-r-md flex items-center justify-center cursor-ew-resize z-20 shadow-lg active:scale-105 transition-transform"
                        style={{ left: `${(trimEnd / (duration || 1)) * 100}%` }}
                        title="Drag to adjust end time"
                      >
                        <div className="w-0.5 h-4 bg-neutral-950 rounded-full" />
                      </div>

                      {/* Current Playhead Scrubber */}
                      <div
                        onPointerDown={(e) => handleTimelinePointerDown('playhead', e)}
                        className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-white z-25 cursor-ew-resize shadow-md"
                        style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                      >
                        <div className="w-3 h-3 rounded-full bg-white -ml-1 -mt-1 shadow-sm" />
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-400 text-center">
                      Tips: Tap anywhere on the timeline to scrub playhead, or drag the green handles to crop the clip.
                    </p>
                  </div>

                  {/* Change Clip File Option */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">
                        Replace Video File
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        Select a different recording from your device
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
                    >
                      Change Video
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIO TRACK SELECTION */}
              {activeTab === 'audio' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                        Audio Track & Music
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Choose a soundtrack to overlay onto your Reel
                      </p>
                    </div>

                    {selectedTrack && (
                      <button
                        type="button"
                        onClick={() => handleSelectAudioTrack(null)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Remove Music
                      </button>
                    )}
                  </div>

                  {/* Audio Categories Filter */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {AUDIO_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setAudioCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          audioCategory === cat.id
                            ? 'bg-pink-500 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Audio Track List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {/* Option 1: Original Audio Only */}
                    <div
                      onClick={() => handleSelectAudioTrack(null)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        !selectedTrack
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            Original Audio Only
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            Uses audio track directly recorded in your video file
                          </p>
                        </div>
                      </div>
                      {!selectedTrack && (
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Pre-packaged royalty-free audio tracks */}
                    {filteredAudioTracks.map(track => {
                      const isSelected = selectedTrack?.id === track.id;
                      const isPreviewing = isPlayingAudioPreview === track.id;

                      return (
                        <div
                          key={track.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                          }`}
                        >
                          <div
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                            onClick={() => handleSelectAudioTrack(track)}
                          >
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-white/10"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white truncate">
                                {track.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                                <span className="truncate">{track.artist}</span>
                                <span>•</span>
                                <span>{track.durationSeconds}s</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Preview sound button */}
                            <button
                              type="button"
                              onClick={() => handleToggleAudioPreview(track)}
                              className={`p-2 rounded-lg transition-colors ${
                                isPreviewing
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              }`}
                              title={isPreviewing ? 'Stop Preview' : 'Preview Sound'}
                            >
                              {isPreviewing ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Select button */}
                            <button
                              type="button"
                              onClick={() => handleSelectAudioTrack(track)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isSelected
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                              }`}
                            >
                              {isSelected ? 'Applied' : 'Use'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Volume Balance Mixers */}
                  {selectedTrack && (
                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                      <span className="text-[11px] font-semibold text-neutral-300 block">
                        Volume Mixer Balance
                      </span>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Original Video Sound</span>
                          <span>{originalAudioVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={originalAudioVolume}
                          onChange={(e) => setOriginalAudioVolume(Number(e.target.value))}
                          className="w-full accent-pink-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Music Track Volume</span>
                          <span>{musicVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(Number(e.target.value))}
                          className="w-full accent-pink-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VISUAL FILTERS */}
              {activeTab === 'filter' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                      Color Gradients & Filters
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Apply cinematic color grading to your reel
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {FILTER_PRESETS.map(filter => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setSelectedFilter(filter.filterClass)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          selectedFilter === filter.filterClass
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded-lg"
                          style={{
                            backgroundColor: filter.previewColor || '#38bdf8'
                          }}
                        />
                        <span className="text-xs font-medium text-neutral-200">
                          {filter.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CAPTION & PUBLISH DETAILS */}
              {activeTab === 'caption' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                      Reel Caption & Description
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Write a hook, add tags, and finalize your short-form video
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      id="reel-caption-input"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write an engaging caption... #reels #explore #viral"
                      rows={4}
                      className="w-full p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-lime-500 transition-colors resize-none"
                    />

                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {['#reels', '#trending', '#aesthetic', '#vibes', '#shortvideo', '#foryou'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setCaption(prev => `${prev ? prev + ' ' : ''}${tag}`)}
                          className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary of clip options */}
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Clip Duration</span>
                      <span className="text-white font-mono">{clipDuration.toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Audio</span>
                      <span className="text-white truncate max-w-[180px]">
                        {selectedTrack ? selectedTrack.title : 'Original Sound'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Filter Grade</span>
                      <span className="text-white capitalize">{selectedFilter.replace('filter-', '')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Discard
              </button>

              <div className="flex items-center gap-2">
                {activeTab !== 'caption' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'trim') setActiveTab('audio');
                      else if (activeTab === 'audio') setActiveTab('filter');
                      else if (activeTab === 'filter') setActiveTab('caption');
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="reels-publish-btn"
                    onClick={handlePublishClick}
                    disabled={!videoUrl}
                    className="px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-neutral-950 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-all shadow-lg shadow-lime-500/10 cursor-pointer"
                  >
                    <span>Share Reel</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelsEditor;
