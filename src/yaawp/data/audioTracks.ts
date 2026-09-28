import { ReelAudioTrack } from '../types';

/**
 * Royalty-free, reliable audio tracks with generated ambient & synthesizer tones
 * for in-browser playback, plus fallback audio preview synthesizers using Web Audio API.
 */
export const POPULAR_AUDIO_TRACKS: ReelAudioTrack[] = [
  {
    id: 'track_midnight_city',
    title: 'Midnight City Groove',
    artist: 'Lofi Horizons',
    durationSeconds: 30,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    category: 'lofi'
  },
  {
    id: 'track_summer_vibes',
    title: 'Golden Sunset Vibes',
    artist: 'Coastal Drift',
    durationSeconds: 24,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=summer-walk-111166.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=150&auto=format&fit=crop&q=80',
    category: 'trending'
  },
  {
    id: 'track_cyber_pulse',
    title: 'Neon Cyber Pulse',
    artist: 'Future Echoes',
    durationSeconds: 28,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
    category: 'electronic'
  },
  {
    id: 'track_chill_beats',
    title: 'Coffeehouse Acoustic Flow',
    artist: 'Acoustic Soul',
    durationSeconds: 32,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=acoustic-guitars-ambient-uplifting-9189.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=150&auto=format&fit=crop&q=80',
    category: 'pop'
  },
  {
    id: 'track_street_rhythm',
    title: 'Urban Boom Bap',
    artist: 'Metro Beatmakers',
    durationSeconds: 25,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77270.mp3?filename=tuesday-glitch-122413.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=80',
    category: 'hiphop'
  },
  {
    id: 'track_deep_zen',
    title: 'Deep Ambient Aurora',
    artist: 'Solaris Cloud',
    durationSeconds: 40,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c35272a5a5.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
    category: 'ambient'
  }
];

export const AUDIO_CATEGORIES = [
  { id: 'all', label: 'All Sounds' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'lofi', label: '☕ Lo-Fi & Chill' },
  { id: 'electronic', label: '⚡ Electronic' },
  { id: 'hiphop', label: '🎧 Hip-Hop' },
  { id: 'pop', label: '✨ Pop & Acoustic' },
  { id: 'ambient', label: '🌌 Ambient' }
];

/**
 * Creates a synthetic melodic audio snippet via the Web Audio API if network/audio is blocked
 */
export function playSyntheticAudioPreview(trackId: string, durationMs = 5000): () => void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();

    // Map track to base frequency
    const freqMap: Record<string, number> = {
      track_midnight_city: 220,
      track_summer_vibes: 261.63,
      track_cyber_pulse: 329.63,
      track_chill_beats: 196,
      track_street_rhythm: 146.83,
      track_deep_zen: 174.61
    };

    const baseFreq = freqMap[trackId] || 220;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = trackId === 'track_cyber_pulse' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    // Subtle arpeggio modulation
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.6);
    osc.frequency.setValueAtTime(baseFreq * 1.8, ctx.currentTime + 0.9);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);

    return () => {
      try {
        osc.stop();
        ctx.close();
      } catch {}
    };
  } catch {
    return () => {};
  }
}
