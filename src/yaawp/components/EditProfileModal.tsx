// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Check, Upload, Loader2, Globe, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadMediaToSupabase } from '../lib/supabaseStorage';
import { INITIAL_LANGUAGES } from '../translations';
import {
  checkUsernameAvailability,
  sanitizeUsername
} from '../utils/usernameValidation';

export const EditProfileModal: React.FC = () => {
  const {
    isEditProfileOpen,
    setIsEditProfileOpen,
    currentUser,
    userProfiles,
    updateProfile,
    showToast,
    preferredLanguage,
    setPreferredLanguage
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [bio, setBio] = useState(currentUser.bio);
  const [website, setWebsite] = useState(currentUser.website || '');
  const [language, setLanguage] = useState(currentUser.preferred_language || preferredLanguage || 'en');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or currentUser updates
  useEffect(() => {
    if (isEditProfileOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setUsernameStatus('idle');
      setUsernameError(null);
      setUsernameSuggestions([]);
      setBio(currentUser.bio);
      setWebsite(currentUser.website || '');
      setLanguage(currentUser.preferred_language || preferredLanguage || 'en');
      setAvatar(currentUser.avatar);
      setSelectedFile(null);
    }
  }, [isEditProfileOpen, currentUser, preferredLanguage]);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    const clean = sanitizeUsername(val);
    if (!clean) {
      setUsernameStatus('invalid');
      setUsernameError('Username cannot be empty.');
      setUsernameSuggestions([]);
      return;
    }
    if (clean === currentUser.username.toLowerCase()) {
      setUsernameStatus('available');
      setUsernameError(null);
      setUsernameSuggestions([]);
      return;
    }

    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    setUsernameStatus('checking');
    checkTimerRef.current = setTimeout(async () => {
      const res = await checkUsernameAvailability(clean, userProfiles, currentUser.id);
      if (!res.isValid) {
        setUsernameStatus('invalid');
        setUsernameError(res.error || 'Invalid username format.');
        setUsernameSuggestions(res.suggestions);
      } else if (!res.isAvailable) {
        setUsernameStatus('taken');
        setUsernameError(res.error || `This username @${clean} is already taken.`);
        setUsernameSuggestions(res.suggestions);
      } else {
        setUsernameStatus('available');
        setUsernameError(null);
        setUsernameSuggestions([]);
      }
    }, 300);
  };

  if (!isEditProfileOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = sanitizeUsername(username);

    if (!cleanUsername || cleanUsername.length < 3) {
      showToast('Username must be at least 3 characters.');
      return;
    }

    setIsSaving(true);
    try {
      if (cleanUsername !== currentUser.username.toLowerCase()) {
        const check = await checkUsernameAvailability(cleanUsername, userProfiles, currentUser.id);
        if (!check.isAvailable) {
          setUsernameStatus('taken');
          setUsernameError(check.error || `The username @${cleanUsername} is taken.`);
          setUsernameSuggestions(check.suggestions);
          setIsSaving(false);
          return;
        }
      }

      let finalAvatar = avatar;

      if (selectedFile) {
        const uploadRes = await uploadMediaToSupabase(selectedFile, 'avatars', undefined, currentUser.id);
        if (uploadRes.url) {
          finalAvatar = uploadRes.url;
        }
      }

      updateProfile({
        name: name.trim() || currentUser.name,
        username: cleanUsername,
        bio: bio.trim(),
        website: website.trim() || undefined,
        avatar: finalAvatar,
        preferred_language: language
      });
      if (language !== preferredLanguage) {
        setPreferredLanguage(language);
      }
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error('Failed to update avatar:', err);
      showToast('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="edit-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 ambient-glow">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Edit profile
          </h3>
          <button
            id="save-profile-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Save
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Save
              </>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile picture"
              >
                <img
                  src={avatar}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  @{username}
                </span>
                <button
                  type="button"
                  id="upload-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload new photo
                </button>
                <p className="text-[10px] text-slate-400">
                  PNG, JPG supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Full Name
            </label>
            <input
              id="edit-name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Username
              </label>
              {usernameStatus === 'checking' && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                </span>
              )}
              {usernameStatus === 'available' && (
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                  <Check className="w-2.5 h-2.5" /> Available
                </span>
              )}
              {usernameStatus === 'taken' && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-2.5 h-2.5" /> Taken
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                @
              </span>
              <input
                id="edit-username-input"
                type="text"
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                className={`w-full pl-7 pr-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                  usernameStatus === 'available'
                    ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500'
                }`}
                required
              />
            </div>

            {/* Suggestions if taken */}
            {usernameStatus === 'taken' && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] text-rose-500 font-medium">
                  {usernameError || `This username is already taken.`}
                </p>
                {usernameSuggestions.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg space-y-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                      Available suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {usernameSuggestions.map(sug => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleUsernameChange(sug)}
                          className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-emerald-500 hover:border-emerald-500 font-mono transition-colors cursor-pointer"
                        >
                          @{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Website */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Website
            </label>
            <input
              id="edit-website-input"
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                Preferred Language
              </label>
              <span className="text-[10px] text-slate-400">
                30 available
              </span>
            </div>
            <select
              id="edit-preferred-language-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {INITIAL_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Bio
              </label>
              <span className="text-[10px] text-slate-400">
                {bio.length}/150
              </span>
            </div>
            <textarea
              id="edit-bio-input"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={150}
              placeholder="Write a short bio about yourself..."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

