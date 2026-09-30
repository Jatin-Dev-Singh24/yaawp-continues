// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Smile,
  Hash,
  Check,
  Lock,
  Globe,
  Users,
  Shield,
  Sliders,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileText,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Zap,
  Loader2,
  Crop,
  Bookmark,
  Trash2,
  BarChart2,
  Plus,
  Film,
  Scissors
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReelsEditor } from './ReelsEditor';
import { PostDraft, StoryPoll } from '../types';
import { FILTER_PRESETS } from '../data/mockData';
import { uploadMediaToSupabase } from '../lib/supabaseStorage';
import { DEFAULT_QUICK_REACTIONS, ALL_PRESET_EMOJIS, EMOJI_CATEGORIES } from '../data/emojis';
import {
  EmojiBlend,
  detectEmojiBlendInText,
  formatBlendToken
} from '../data/emojiKitchen';
import { EmojiKitchenModal } from './EmojiKitchenModal';
import { EmojiBlendSuggestionBanner } from './EmojiBlendSuggestionBanner';
import { ImageCropper } from './ImageCropper';
import {
  convertImageToWebP,
  extractVideoThumbnailWebP,
  generateTextPostCardWebP,
  isVideoUrl
} from '../utils/mediaConverter';

export const CreatePostModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    currentUser,
    createPost,
    createStory,
    createReel,
    customCircles,
    communities,
    showToast
  } = useApp();

  const [showReelsEditor, setShowReelsEditor] = useState(false);

  const [step, setStep] = useState<'media' | 'crop' | 'filter' | 'caption'>('media');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawUncroppedImage, setRawUncroppedImage] = useState<string>('');
  const [rawUncroppedFile, setRawUncroppedFile] = useState<File | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('filter-normal');
  const [caption, setCaption] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [shareTarget, setShareTarget] = useState<'post' | 'story'>('post');
  const [audience, setAudience] = useState<'everyone' | 'followers' | 'close_friends' | 'custom_circle' | 'community'>('everyone');
  const [selectedCircleId, setSelectedCircleId] = useState<string>(customCircles[0]?.id || '');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(communities[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post Format & Media WebP conversion states
  const [postCategory, setPostCategory] = useState<'media' | 'text'>('media');
  const [textPostContent, setTextPostContent] = useState('');
  const [textPostTheme, setTextPostTheme] = useState<'slate' | 'indigo' | 'emerald' | 'amber' | 'sunset' | 'dark'>('indigo');
  const [isVideo, setIsVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isConvertingMedia, setIsConvertingMedia] = useState(false);
  const [webpBadge, setWebpBadge] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [isMutedPreview, setIsMutedPreview] = useState(true);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Additional settings: Emoji controls
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);
  const [customEmojiControl, setCustomEmojiControl] = useState(false);
  const [allowedEmojis, setAllowedEmojis] = useState<string[]>([...DEFAULT_QUICK_REACTIONS]);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>(EMOJI_CATEGORIES[0].name);

  // Emoji Kitchen state
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [dismissedBlendKey, setDismissedBlendKey] = useState<string | null>(null);

  // Future Post Scheduling State
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');

  // Post Drafts State
  const [postDrafts, setPostDrafts] = useState<PostDraft[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('connecthub_post_drafts') || '[]');
    } catch {
      return [];
    }
  });
  const [showDraftsList, setShowDraftsList] = useState(false);

  // Interactive Story Poll State
  const [hasStoryPoll, setHasStoryPoll] = useState(false);
  const [storyPollQuestion, setStoryPollQuestion] = useState('');
  const [storyPollOptions, setStoryPollOptions] = useState<string[]>(['Yes 👍', 'No 👎']);

  const handleAddPollOption = () => {
    if (storyPollOptions.length < 4) {
      setStoryPollOptions(prev => [...prev, `Option ${prev.length + 1}`]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (storyPollOptions.length > 2) {
      setStoryPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePollOption = (index: number, val: string) => {
    setStoryPollOptions(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreateModalOpen) return null;

  const saveCurrentAsDraft = () => {
    if (!caption.trim() && !textPostContent.trim() && !selectedImage && !videoPreviewUrl) {
      showToast('Nothing to save as draft');
      return;
    }
    const newDraft: PostDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caption: caption.trim() || textPostContent.trim(),
      category: postCategory,
      shareTarget,
      textPostContent: postCategory === 'text' ? textPostContent : undefined,
      textPostTheme: postCategory === 'text' ? textPostTheme : undefined,
      mediaUrl: selectedImage || videoPreviewUrl || undefined,
      hasStoryPoll,
      storyPollQuestion: hasStoryPoll ? storyPollQuestion : undefined,
      storyPollOptions: hasStoryPoll ? storyPollOptions : undefined,
      savedAt: Date.now()
    };
    const updated = [newDraft, ...postDrafts.filter(d => d.id !== newDraft.id).slice(0, 9)];
    setPostDrafts(updated);
    try {
      localStorage.setItem('connecthub_post_drafts', JSON.stringify(updated));
    } catch {}
    showToast('Saved to drafts!');
    resetAndClose();
  };

  const restoreDraft = (draft: PostDraft) => {
    setPostCategory(draft.category || 'media');
    if (draft.shareTarget) {
      setShareTarget(draft.shareTarget);
    }
    setCaption(draft.caption || '');
    if (draft.category === 'text') {
      setTextPostContent(draft.textPostContent || draft.caption || '');
      setTextPostTheme(draft.textPostTheme || 'indigo');
      setStep('caption');
    } else if (draft.mediaUrl) {
      setSelectedImage(draft.mediaUrl);
      setRawUncroppedImage(draft.mediaUrl);
      setStep('caption');
    } else {
      setStep('caption');
    }
    if (draft.hasStoryPoll) {
      setHasStoryPoll(true);
      setStoryPollQuestion(draft.storyPollQuestion || '');
      setStoryPollOptions(draft.storyPollOptions || ['Yes 👍', 'No 👎']);
    }
    setShowDraftsList(false);
    showToast('Draft restored!');
  };

  const deleteDraft = (draftId: string) => {
    const updated = postDrafts.filter(d => d.id !== draftId);
    setPostDrafts(updated);
    try {
      localStorage.setItem('connecthub_post_drafts', JSON.stringify(updated));
    } catch {}
    showToast('Draft removed');
  };

  // Preset time setters
  const setPresetPlusOneHour = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    setScheduledDate(d.toISOString().split('T')[0]);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setScheduledTime(`${hours}:${mins}`);
  };

  const setPresetTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setScheduledDate(d.toISOString().split('T')[0]);
    setScheduledTime('09:00');
  };

  const setPresetTomorrowEvening = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setScheduledDate(d.toISOString().split('T')[0]);
    setScheduledTime('18:00');
  };

  const setPresetTwoDays = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setScheduledDate(d.toISOString().split('T')[0]);
    setScheduledTime('12:00');
  };

  const scheduledSummaryText = () => {
    try {
      const target = new Date(`${scheduledDate}T${scheduledTime}`);
      if (isNaN(target.getTime())) return 'Please select a valid date and time';
      if (target.getTime() <= Date.now()) {
        return 'Selected time is in the past. Please choose a future time.';
      }
      return `Will be published on ${target.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })} at ${target.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    } catch {
      return 'Scheduled for selected time';
    }
  };

  const toggleAllowedEmoji = (emoji: string) => {
    setAllowedEmojis(prev => {
      if (prev.includes(emoji)) {
        if (prev.length <= 1) return prev;
        return prev.filter(e => e !== emoji);
      } else {
        return [...prev, emoji];
      }
    });
  };

  const handleCropComplete = (croppedDataUrl: string, croppedFile: File, badge?: string) => {
    setSelectedImage(croppedDataUrl);
    setSelectedFile(croppedFile);
    if (badge) {
      setWebpBadge(badge);
    }
    setStep('filter');
    showToast('Photo formatted and cropped! Select your filter.');
  };

  const handleSkipCrop = () => {
    if (rawUncroppedImage) {
      setSelectedImage(rawUncroppedImage);
      setSelectedFile(rawUncroppedFile);
    }
    setStep('filter');
  };

  const processSelectedMediaFile = async (file: File) => {
    setIsConvertingMedia(true);
    try {
      if (file.type.startsWith('video/')) {
        setIsVideo(true);
        const objUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(objUrl);
        // Extract video frame thumbnail and convert to WebP
        const thumbResult = await extractVideoThumbnailWebP(file);
        setSelectedFile(thumbResult.file);
        setSelectedImage(thumbResult.dataUrl);
        setRawUncroppedFile(thumbResult.file);
        setRawUncroppedImage(thumbResult.dataUrl);
        setWebpBadge('Video attached · HD Poster');
        setStep('filter');
        showToast('Video processed! HD poster thumbnail generated.');
      } else {
        setIsVideo(false);
        setVideoPreviewUrl('');
        // Convert any image (PNG, JPG, JPEG, GIF, SVG, etc.) to WebP format
        const webpResult = await convertImageToWebP(file);
        setRawUncroppedFile(webpResult.file);
        setRawUncroppedImage(webpResult.dataUrl);
        setSelectedFile(webpResult.file);
        setSelectedImage(webpResult.dataUrl);
        setWebpBadge('⚡ Optimized photo format');
        setStep('crop');
        showToast('Image loaded! Crop & format before applying filters.');
      }
    } catch (err) {
      console.warn('Conversion error, fallback to raw reader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setSelectedImage(res);
        setSelectedFile(file);
        setRawUncroppedImage(res);
        setRawUncroppedFile(file);
        setStep('crop');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsConvertingMedia(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedMediaFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedMediaFile(file);
    }
  };

  const handleGenerateTextPost = async () => {
    if (!textPostContent.trim()) {
      showToast('Please type your text post content');
      return;
    }
    if (shareTarget === 'post') {
      // For feed posts: pure text message like Reddit or a caption, no card templates needed
      setSelectedImage('');
      setSelectedFile(null);
      setCaption(textPostContent.trim());
      setStep('caption');
      showToast('Text post ready!');
      return;
    }
    // For 24h stories: themed card templates
    setIsConvertingMedia(true);
    try {
      const cardResult = await generateTextPostCardWebP(textPostContent.trim(), {
        authorName: currentUser.name,
        username: currentUser.username,
        theme: textPostTheme
      });
      setSelectedImage(cardResult.dataUrl);
      setSelectedFile(cardResult.file);
      setWebpBadge('⚡ Story card ready');
      if (!caption) {
        setCaption(textPostContent.trim());
      }
      setStep('caption');
      showToast('Story card created!');
    } catch (err) {
      console.error('Error generating text card:', err);
      showToast('Failed to create story card');
    } finally {
      setIsConvertingMedia(false);
    }
  };

  const handleSubmit = async () => {
    if (postCategory === 'text') {
      if (!textPostContent.trim() && !caption.trim()) {
        showToast('Please enter content for your text post');
        return;
      }
    } else {
      if (!selectedImage && !videoPreviewUrl) return;
    }

    setIsSubmitting(true);
    try {
      let finalMediaUrl = selectedImage;
      const finalVideoUrl = videoPreviewUrl || undefined;

      // Upload directly to Supabase Storage if user selected an actual converted file
      if (selectedFile) {
        const uploadRes = await uploadMediaToSupabase(
          selectedFile,
          shareTarget === 'post' ? 'posts' : 'stories',
          undefined,
          currentUser.id
        );
        if (uploadRes.url && !uploadRes.url.startsWith('blob:')) {
          finalMediaUrl = uploadRes.url;
        }
      }

      if (shareTarget === 'post') {
        if (isScheduling) {
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
          if (isNaN(scheduledDateTime.getTime()) || scheduledDateTime.getTime() <= Date.now()) {
            showToast('Please select a future date and time for scheduling.');
            setIsSubmitting(false);
            return;
          }
        }

        createPost({
          mediaUrls: postCategory === 'text' ? [] : (finalMediaUrl ? [finalMediaUrl] : []),
          videoUrl: isVideo ? (finalVideoUrl || finalMediaUrl) : undefined,
          isTextPost: postCategory === 'text',
          textPostTheme: postCategory === 'text' ? textPostTheme : undefined,
          postType: postCategory === 'text' ? 'text' : isVideo ? 'video' : 'image',
          caption: caption.trim() || (postCategory === 'text' ? textPostContent.trim() : ''),
          location: location.trim() || undefined,
          filterClass: selectedFilter,
          audience,
          audienceCircleId: audience === 'custom_circle' ? selectedCircleId : undefined,
          communityId: audience === 'community' ? selectedCommunityId : undefined,
          allowedEmojis: customEmojiControl ? allowedEmojis : undefined,
          isScheduled: isScheduling,
          scheduledPublishTime: isScheduling ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : undefined
        });
        showToast(
          postCategory === 'text'
            ? 'Text post published!'
            : isVideo
            ? 'Video post shared!'
            : 'Post shared!'
        );
      } else {
        let storyPollData: StoryPoll | undefined = undefined;
        if (hasStoryPoll && storyPollQuestion.trim()) {
          const validOptions = storyPollOptions
            .map(t => t.trim())
            .filter(t => t.length > 0);
          if (validOptions.length >= 2) {
            storyPollData = {
              id: `poll_${Date.now()}`,
              question: storyPollQuestion.trim(),
              options: validOptions.map((text, idx) => ({
                id: `opt_${Date.now()}_${idx}`,
                text,
                votes: 0
              })),
              totalVotes: 0
            };
          }
        }
        createStory(
          finalMediaUrl,
          caption,
          storyPollData,
          postCategory === 'text',
          textPostTheme
        );
        showToast('Story published!');
      }
      resetAndClose();
    } catch (err) {
      console.error('Failed to submit post:', err);
      showToast('Error sharing post, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('media');
    setPostCategory('media');
    setTextPostContent('');
    setTextPostTheme('indigo');
    setIsVideo(false);
    setVideoPreviewUrl('');
    setWebpBadge(null);
    setSelectedImage('');
    setSelectedFile(null);
    setRawUncroppedImage('');
    setRawUncroppedFile(null);
    setSelectedFilter('filter-normal');
    setCaption('');
    setLocation('');
    setShareTarget('post');
    setShowAdditionalSettings(false);
    setCustomEmojiControl(false);
    setAllowedEmojis([...DEFAULT_QUICK_REACTIONS]);
    setIsScheduling(false);
    setHasStoryPoll(false);
    setStoryPollQuestion('');
    setStoryPollOptions(['Yes 👍', 'No 👎']);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    setScheduledTime('09:00');
    setIsCreateModalOpen(false);
  };

  const insertHashtag = (tag: string) => {
    setCaption(prev => (prev ? `${prev} ${tag}` : tag));
  };

  return (
    <div
      id="create-post-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6"
    >
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16">
            {step !== 'media' && (
              <button
                onClick={() => {
                  if (step === 'caption') {
                    setStep(postCategory === 'text' ? 'media' : 'filter');
                  } else if (step === 'filter') {
                    if (isVideo || postCategory === 'text') {
                      setStep('media');
                    } else {
                      setStep('crop');
                    }
                  } else if (step === 'crop') {
                    setStep('media');
                  }
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {step === 'media' && (postCategory === 'text' ? 'Create Text Post' : 'Create Media Post')}
            {step === 'crop' && 'Crop & Format Photo'}
            {step === 'filter' && (isVideo ? 'Video Preview & Poster' : 'Filters & Adjustments')}
            {step === 'caption' && (isScheduling ? 'Schedule post' : 'Post details')}
          </h3>

          <div className="flex items-center justify-end gap-1.5 min-w-[6rem]">
            {step === 'media' && postDrafts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDraftsList(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 border border-indigo-200/80 dark:border-indigo-800/80"
                title="View saved drafts"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Drafts ({postDrafts.length})</span>
              </button>
            )}

            {step === 'crop' && (
              <button
                type="button"
                onClick={handleSkipCrop}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-2 py-1"
              >
                Skip Crop
              </button>
            )}

            {step === 'filter' && (
              <button
                onClick={() => setStep('caption')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 px-2 py-1"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 'caption' && (
              <>
                <button
                  type="button"
                  onClick={saveCurrentAsDraft}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                  title="Save current post as draft"
                >
                  <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Save Draft</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    isScheduling ? 'Scheduling...' : 'Sharing...'
                  ) : isScheduling ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Schedule
                    </>
                  ) : (
                    'Share'
                  )}
                </button>
              </>
            )}

            <button
              onClick={resetAndClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saved Drafts Overlay View */}
        {showDraftsList && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Saved Drafts ({postDrafts.length})</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftsList(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label="Close drafts"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {postDrafts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No saved drafts yet.
                </div>
              ) : (
                postDrafts.map(draft => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500/50 transition-all"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => restoreDraft(draft)}
                    >
                      {draft.mediaUrl ? (
                        <img src={draft.mediaUrl} alt="Draft preview" className="w-11 h-11 rounded-lg object-cover bg-black/10 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {draft.caption || draft.textPostContent || 'Untitled post'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="capitalize">{draft.category} post</span>
                          <span>•</span>
                          <span>{new Date(draft.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => restoreDraft(draft)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDraft(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 flex-1">
          {/* STEP 1: SELECT MEDIA OR CREATE TEXT POST */}
          {step === 'media' && (
            <div className="flex flex-col items-center justify-center py-2">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6 w-full max-w-sm border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPostCategory('media')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    postCategory === 'media'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo / Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostCategory('text')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    postCategory === 'text'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReelsEditor(true)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-lime-600 dark:text-lime-400 hover:bg-lime-500/10 transition-all"
                  title="Open Reels Editor with trimming & soundtrack selection"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Create Reel</span>
                </button>
              </div>

              {/* PHOTO / VIDEO MODE */}
              {postCategory === 'media' && (
                <>
                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md aspect-4/3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40 relative overflow-hidden"
                  >
                    {isConvertingMedia ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Processing media...
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Optimizing image and performance
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Drag photos or videos here, or click to browse
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            PNG, JPG, JPEG, GIF, SVG & MP4, MOV videos
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                        >
                          Select from Computer
                        </button>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              {/* TEXT POST MODE */}
              {postCategory === 'text' && (
                <div className="w-full max-w-lg space-y-4">
                  {/* Share Target Selector: Feed Post vs 24h Story */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setShareTarget('post')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        shareTarget === 'post'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Feed Text Post</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareTarget('story')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        shareTarget === 'story'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Themed Story Card</span>
                    </button>
                  </div>

                  {shareTarget === 'post' ? (
                    /* FEED POST: Mere text message like a caption / Reddit post */
                    <div className="space-y-3">
                      {/* Reddit-style Post Preview */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {currentUser.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              @{currentUser.username} · Feed Post
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed min-h-[48px] px-0.5">
                          {textPostContent.trim() || (
                            <span className="text-slate-400 italic">
                              Your text post will appear here as a clean discussion message in the feed...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Text Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Post Content
                        </label>
                        <textarea
                          value={textPostContent}
                          onChange={e => setTextPostContent(e.target.value)}
                          rows={4}
                          placeholder="What's on your mind? Share thoughts, links, questions, or ideas with your feed..."
                          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Quick Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['#thoughts', '#discussion', '#update', '#question', '#community'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setTextPostContent(prev => prev ? `${prev} ${tag}` : tag)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Continue Button */}
                      <button
                        type="button"
                        onClick={handleGenerateTextPost}
                        disabled={!textPostContent.trim()}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Continue with Text Post</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* STORY POST: Themed Card Templates */
                    <div className="space-y-4">
                      {/* Theme Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Story Card Theme
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { id: 'indigo', label: 'Indigo', bg: 'bg-linear-to-br from-indigo-900 to-slate-900 text-white' },
                            { id: 'sunset', label: 'Sunset', bg: 'bg-linear-to-br from-pink-600 to-amber-700 text-white' },
                            { id: 'emerald', label: 'Emerald', bg: 'bg-linear-to-br from-emerald-800 to-teal-950 text-white' },
                            { id: 'amber', label: 'Amber', bg: 'bg-linear-to-br from-amber-600 to-orange-900 text-white' },
                            { id: 'slate', label: 'Slate', bg: 'bg-linear-to-br from-slate-800 to-slate-950 text-white' },
                            { id: 'dark', label: 'Midnight', bg: 'bg-linear-to-br from-zinc-950 to-black text-white' }
                          ].map(th => (
                            <button
                              key={th.id}
                              type="button"
                              onClick={() => setTextPostTheme(th.id as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                textPostTheme === th.id
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                              } ${th.bg}`}
                            >
                              {th.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Themed Story Live Preview Card */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Story Card Preview
                        </label>
                        <div
                          className={`relative aspect-square sm:aspect-4/3 w-full rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg text-white ${
                            textPostTheme === 'indigo'
                              ? 'bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-950'
                              : textPostTheme === 'sunset'
                              ? 'bg-linear-to-br from-rose-700 via-pink-800 to-amber-800'
                              : textPostTheme === 'emerald'
                              ? 'bg-linear-to-br from-emerald-800 via-teal-900 to-slate-950'
                              : textPostTheme === 'amber'
                              ? 'bg-linear-to-br from-amber-600 via-orange-800 to-stone-900'
                              : textPostTheme === 'slate'
                              ? 'bg-linear-to-br from-slate-800 via-slate-900 to-zinc-950'
                              : 'bg-linear-to-br from-zinc-950 via-stone-950 to-black'
                          }`}
                        >
                          {/* Author header */}
                          <div className="flex items-center gap-3">
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                            />
                            <div>
                              <div className="font-bold text-sm leading-tight text-white">
                                {currentUser.name}
                              </div>
                              <div className="text-xs text-white/70">
                                @{currentUser.username} · Story
                              </div>
                            </div>
                          </div>

                          {/* Text content preview */}
                          <div className="my-auto py-4">
                            <p className="text-lg sm:text-xl font-medium leading-relaxed drop-shadow-xs break-words">
                              {textPostContent.trim() || 'Type your story message below...'}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Themed Story
                            </span>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-medium">
                              24H
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Text Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Story Text
                        </label>
                        <textarea
                          value={textPostContent}
                          onChange={e => setTextPostContent(e.target.value)}
                          rows={3}
                          placeholder="Type your story announcement, quote, or message..."
                          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Continue Button */}
                      <button
                        type="button"
                        onClick={handleGenerateTextPost}
                        disabled={isConvertingMedia || !textPostContent.trim()}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        {isConvertingMedia ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Story Card...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Create Story Card & Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 1.5: CROP & FORMAT PHOTO */}
          {step === 'crop' && (
            <div className="py-1">
              <ImageCropper
                imageSrc={rawUncroppedImage || selectedImage}
                onCropComplete={handleCropComplete}
                onSkip={handleSkipCrop}
                onBack={() => setStep('media')}
              />
            </div>
          )}

          {/* STEP 2: APPLY FILTERS OR PREVIEW VIDEO */}
          {step === 'filter' && (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Preview Media Container */}
              <div className="w-full md:w-3/5 aspect-square bg-slate-950 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative group">
                {isVideo && videoPreviewUrl ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <video
                      ref={videoPreviewRef}
                      src={videoPreviewUrl}
                      controls
                      autoPlay
                      loop
                      muted={isMutedPreview}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-mono">
                      <Video className="w-3 h-3 text-red-400" />
                      <span>Video Preview</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className={`w-full h-full object-cover ${selectedFilter}`}
                    />
                    {/* Re-crop overlay button */}
                    <button
                      type="button"
                      onClick={() => setStep('crop')}
                      title="Adjust image crop & aspect ratio"
                      className="absolute top-3 right-3 z-10 bg-black/75 hover:bg-black/90 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium border border-white/15 transition-all shadow-md hover:border-lime-400/50"
                    >
                      <Crop className="w-3.5 h-3.5 text-lime-400" />
                      <span>Adjust Crop</span>
                    </button>
                  </>
                )}

                {/* Storage Format Pill */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>{webpBadge || 'High Quality'}</span>
                </div>
              </div>

              {/* Adjustments & Details */}
              <div className="w-full md:w-2/5 flex flex-col gap-3">
                {isVideo ? (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Video className="w-4 h-4 text-indigo-500" />
                      <span>Video Post Configuration</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your video will play smoothly across feed cards with a high-speed poster thumbnail.
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReelsEditor(true)}
                        className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-lime-400 border border-lime-500/30 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Scissors className="w-3.5 h-3.5 text-lime-400" />
                        <span>Trim & Add Music in Reels Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('caption')}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Continue to Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Filters ({FILTER_PRESETS.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep('crop')}
                          className="text-[11px] font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 flex items-center gap-1 transition-colors"
                        >
                          <Crop className="w-3 h-3" />
                          <span>Re-crop</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {FILTER_PRESETS.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFilter(f.filterClass)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all ${
                            selectedFilter === f.filterClass
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700">
                            <img
                              src={selectedImage}
                              alt={f.name}
                              className={`w-full h-full object-cover ${f.filterClass}`}
                            />
                            {selectedFilter === f.filterClass && (
                              <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {f.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CAPTION & DETAILS */}
          {step === 'caption' && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Mini Preview */}
              <div className="w-full md:w-2/5 aspect-square rounded-xl overflow-hidden bg-slate-950 relative">
                {isVideo && videoPreviewUrl ? (
                  <video
                    src={videoPreviewUrl}
                    controls
                    muted
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedImage}
                    alt="Post preview"
                    className={`w-full h-full object-cover ${selectedFilter}`}
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                  <Zap className="w-2.5 h-2.5 text-emerald-400" />
                  <span>HD</span>
                </div>
              </div>

              {/* Form details */}
              <div className="w-full md:w-3/5 flex flex-col gap-4">
                {/* Post or Story toggle */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setShareTarget('post')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      shareTarget === 'post'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Feed Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTarget('story')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      shareTarget === 'story'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    24h Story
                  </button>
                </div>

                {/* Who sees this post? Audience selector */}
                {shareTarget === 'post' && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        Who sees this post?
                      </span>
                    </label>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setAudience('everyone')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          audience === 'everyone'
                            ? 'border-indigo-500 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Everyone
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudience('followers')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          audience === 'followers'
                            ? 'border-indigo-500 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Followers
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudience('close_friends')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          audience === 'close_friends'
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Close Friends
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setAudience('custom_circle')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          audience === 'custom_circle'
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Custom Circle
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudience('community')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          audience === 'community'
                            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Community
                      </button>
                    </div>

                    {/* Circle selector */}
                    {audience === 'custom_circle' && (
                      <div className="pt-2">
                        <select
                          value={selectedCircleId}
                          onChange={e => setSelectedCircleId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          {customCircles.map(circle => (
                            <option key={circle.id} value={circle.id}>
                              {circle.icon} {circle.name} ({circle.userIds.length} members)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Community selector */}
                    {audience === 'community' && (
                      <div className="pt-2">
                        <select
                          value={selectedCommunityId}
                          onChange={e => setSelectedCommunityId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          {communities.map(comm => (
                            <option key={comm.id} value={comm.id}>
                              {comm.name} ({comm.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Caption input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Caption
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsKitchenOpen(true)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:scale-102 transition-transform cursor-pointer"
                      title="Open Emoji Kitchen mixer"
                    >
                      <span>🧪 Emoji Kitchen</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Write a caption... (mix emojis like 🐱❤️ or use #hashtags)"
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  
                  {/* Real-time Emoji Blend Detection Banner */}
                  {(() => {
                    const detected = detectEmojiBlendInText(caption);
                    if (detected && dismissedBlendKey !== `${detected.blend.id}_${detected.match}`) {
                      return (
                        <div className="py-1">
                          <EmojiBlendSuggestionBanner
                            blend={detected.blend}
                            onApplyBlend={blend => {
                              const token = formatBlendToken(blend);
                              setCaption(prev => prev.replace(detected.match, `${token} `));
                            }}
                            onOpenKitchen={blend => {
                              setIsKitchenOpen(true);
                            }}
                            onDismiss={() => {
                              setDismissedBlendKey(`${detected.blend.id}_${detected.match}`);
                            }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{caption.length}/2200</span>
                    <span className="text-[10px] text-slate-400">
                      Supports emoji kitchen stickers [kitchen:id]
                    </span>
                  </div>
                </div>

                {/* Hashtag shortcuts */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Popular Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['#photography', '#wanderlust', '#vibes', '#aesthetic', '#minimal', '#streetstyle'].map(
                      tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertHashtag(tag)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Location input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Add Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Shibuya, Tokyo, Japan"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Future Date and Time Scheduling */}
                {shareTarget === 'post' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                            Schedule for Later
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            Pick a future date and time to publish automatically
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScheduling(prev => !prev)}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                          isScheduling ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle scheduling"
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            isScheduling ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {isScheduling && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={scheduledDate}
                              onChange={e => setScheduledDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                              Time
                            </label>
                            <input
                              type="time"
                              value={scheduledTime}
                              onChange={e => setScheduledTime(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                            Quick presets:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={setPresetPlusOneHour}
                              className="px-2 py-1 text-[10px] font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
                            >
                              +1 Hour
                            </button>
                            <button
                              type="button"
                              onClick={setPresetTomorrowMorning}
                              className="px-2 py-1 text-[10px] font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
                            >
                              Tomorrow 9:00 AM
                            </button>
                            <button
                              type="button"
                              onClick={setPresetTomorrowEvening}
                              className="px-2 py-1 text-[10px] font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
                            >
                              Tomorrow 6:00 PM
                            </button>
                            <button
                              type="button"
                              onClick={setPresetTwoDays}
                              className="px-2 py-1 text-[10px] font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
                            >
                              In 2 Days
                            </button>
                          </div>
                        </div>

                        {/* Summary display */}
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{scheduledSummaryText()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Settings (Emoji Reaction Controls) */}
                {shareTarget === 'post' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAdditionalSettings(prev => !prev)}
                      className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                        Additional Settings (Emoji Reactions)
                      </span>
                      {showAdditionalSettings ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {showAdditionalSettings && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                              Restrict or Allow Specific Emojis
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              Choose which reactions audience can use on this post
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomEmojiControl(prev => !prev)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${
                              customEmojiControl ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                customEmojiControl ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {customEmojiControl && (
                          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                Selected reactions ({allowedEmojis.length} allowed):
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Tap to toggle
                              </span>
                            </div>

                            {/* Active allowed chips */}
                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                              {allowedEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleAllowedEmoji(emoji)}
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-indigo-400 text-xs shadow-xs hover:border-rose-400 transition-colors"
                                  title={`Remove ${emoji}`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[10px] text-indigo-500">×</span>
                                </button>
                              ))}
                            </div>

                            {/* Add custom emoji field */}
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={customEmojiInput}
                                onChange={e => setCustomEmojiInput(e.target.value)}
                                placeholder="Type or paste any custom emoji..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customEmojiInput.trim() && !allowedEmojis.includes(customEmojiInput.trim())) {
                                    setAllowedEmojis(prev => [...prev, customEmojiInput.trim()]);
                                    setCustomEmojiInput('');
                                  }
                                }}
                                disabled={!customEmojiInput.trim()}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                              >
                                Add
                              </button>
                            </div>

                            {/* Category selector */}
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                              {EMOJI_CATEGORIES.map(cat => (
                                <button
                                  key={cat.name}
                                  type="button"
                                  onClick={() => setActiveEmojiCategory(cat.name)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 transition-colors ${
                                    activeEmojiCategory === cat.name
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {cat.icon} {cat.name.split(' ')[0]}
                                </button>
                              ))}
                            </div>

                            {/* Grid of emojis in selected category */}
                            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              {(EMOJI_CATEGORIES.find(c => c.name === activeEmojiCategory)?.emojis || []).map(emoji => {
                                const isAllowed = allowedEmojis.includes(emoji);
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => toggleAllowedEmoji(emoji)}
                                    className={`p-1.5 rounded-lg text-base transition-all ${
                                      isAllowed
                                        ? 'bg-indigo-100 dark:bg-indigo-950/60 ring-1 ring-indigo-500 scale-105'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 opacity-60'
                                    }`}
                                    title={isAllowed ? `Allowed: ${emoji}` : `Restricted: ${emoji}`}
                                  >
                                    <span>{emoji}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              Tip: You can also adjust emoji reaction rules anytime after posting via the post's 3-dot options menu.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Story Poll (When 24h Story is selected) */}
                {shareTarget === 'story' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <BarChart2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                            Interactive Story Poll
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            Let viewers vote & see real-time percentage results
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHasStoryPoll(prev => {
                            const next = !prev;
                            if (next && !storyPollQuestion) {
                              setStoryPollQuestion('What do you think? 🤔');
                            }
                            return next;
                          });
                        }}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                          hasStoryPoll ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            hasStoryPoll ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {hasStoryPoll && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800/70 space-y-3 animate-in fade-in duration-150">
                        {/* Poll Question */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                            Poll Question
                          </label>
                          <input
                            type="text"
                            value={storyPollQuestion}
                            onChange={e => setStoryPollQuestion(e.target.value)}
                            placeholder="e.g. Which design is better? 🎨"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Poll Options */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                            Poll Options (2 to 4 choices)
                          </label>
                          {storyPollOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-indigo-500 w-4">
                                {idx + 1}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={e => handleUpdatePollOption(idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              {storyPollOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePollOption(idx)}
                                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                  title="Remove option"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}

                          {storyPollOptions.length < 4 && (
                            <button
                              type="button"
                              onClick={handleAddPollOption}
                              className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Option ({storyPollOptions.length}/4)</span>
                            </button>
                          )}
                        </div>

                        {/* Story Sticker Preview */}
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                            Story Sticker Preview
                          </span>
                          <div className="p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-center shadow-md">
                            <div className="flex items-center justify-center gap-1.5 mb-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                              <BarChart2 className="w-3 h-3" />
                              <span>Interactive Poll</span>
                            </div>
                            <p className="text-xs font-bold text-white mb-2">
                              {storyPollQuestion.trim() || 'Poll question goes here...'}
                            </p>
                            <div className="space-y-1.5">
                              {storyPollOptions.map((opt, i) => (
                                <div
                                  key={i}
                                  className="w-full py-1.5 px-3 rounded-lg bg-white/15 border border-white/20 text-[11px] font-medium text-white/90 text-center"
                                >
                                  {opt.trim() || `Option ${i + 1}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emoji Kitchen Modal */}
      {isKitchenOpen && (
        <EmojiKitchenModal
          isOpen={isKitchenOpen}
          onClose={() => setIsKitchenOpen(false)}
          onSelectBlend={blend => {
            const token = formatBlendToken(blend);
            setCaption(prev => (prev ? `${prev} ${token}` : token));
            setIsKitchenOpen(false);
          }}
          insertButtonLabel="Insert into Caption"
        />
      )}

      {/* Reels Editor with Clip Trimming & Audio Track Selection */}
      {showReelsEditor && (
        <ReelsEditor
          initialVideoUrl={selectedImage || undefined}
          initialVideoFile={selectedFile || null}
          onClose={() => setShowReelsEditor(false)}
          onPublish={reelData => {
            createReel({
              mediaUrl: reelData.videoUrl,
              caption: reelData.caption,
              musicTitle: reelData.musicTitle,
              durationSeconds: reelData.duration,
              filterClass: reelData.filterClass,
              trimStart: reelData.trimStart,
              trimEnd: reelData.trimEnd,
              audioTrackUrl: reelData.audioTrackUrl,
              audioTrackId: reelData.audioTrackId
            });
            setShowReelsEditor(false);
            resetAndClose();
          }}
        />
      )}
    </div>
  );
};
