import React, { useState } from 'react';
import { X, Image as ImageIcon, Film, FileText, Send, Loader2, Upload, Trash2 } from 'lucide-react';
import { uploadMediaToSupabase } from '../lib/supabaseStorage';
import { convertImageToWebP } from '../utils/mediaConverter';

interface MediaAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (mediaUrl: string, mediaType: 'image' | 'video' | 'file', caption: string, fileName?: string) => void;
  recipientName: string;
}

export const MediaAttachmentModal: React.FC<MediaAttachmentModalProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientName
}) => {
  const [activeType, setActiveType] = useState<'image' | 'video' | 'file'>('image');
  const [caption, setCaption] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!selectedUrl && !selectedFile) return;
    setIsUploading(true);
    try {
      let finalUrl = selectedUrl;
      if (selectedFile) {
        const uploadRes = await uploadMediaToSupabase(selectedFile, 'messages');
        if (uploadRes.url) {
          finalUrl = uploadRes.url;
        }
      }
      onSend(finalUrl, activeType, caption, fileName);
      setCaption('');
      setSelectedFile(null);
      setSelectedUrl('');
      setFileName('');
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    try {
      if (file.type.startsWith('video/')) {
        setActiveType('video');
        const fakeUrl = URL.createObjectURL(file);
        setSelectedUrl(fakeUrl);
        setFileName(file.name);
        setSelectedFile(file);
      } else if (file.type.startsWith('image/')) {
        setActiveType('image');
        const converted = await convertImageToWebP(file);
        setSelectedFile(converted.file);
        setSelectedUrl(converted.dataUrl);
        setFileName(converted.file.name);
      } else {
        setActiveType('file');
        setSelectedFile(file);
        setSelectedUrl(URL.createObjectURL(file));
        setFileName(file.name);
      }
    } catch (err) {
      console.warn('Error converting file:', err);
      setSelectedFile(file);
      setSelectedUrl(URL.createObjectURL(file));
      setFileName(file.name);
    } finally {
      setIsConverting(false);
    }
  };

  const handleClearSelected = () => {
    setSelectedUrl('');
    setFileName('');
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Share Media</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Sending to {recipientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Category Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1 bg-slate-50/80 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={() => setActiveType('image')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeType === 'image'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveType('video')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeType === 'video'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Video
          </button>
          <button
            type="button"
            onClick={() => setActiveType('file')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeType === 'file'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Document
          </button>
        </div>

        {/* Upload / Preview Area */}
        <div className="p-4 flex-1 space-y-3">
          {selectedUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2 flex flex-col items-center">
              {activeType === 'image' && (
                <img
                  src={selectedUrl}
                  alt={fileName || 'Preview'}
                  className="max-h-56 w-auto object-contain rounded-xl"
                />
              )}
              {activeType === 'video' && (
                <video
                  src={selectedUrl}
                  controls
                  className="max-h-56 w-full rounded-xl bg-black"
                />
              )}
              {activeType === 'file' && (
                <div className="py-8 flex flex-col items-center gap-2">
                  <FileText className="w-12 h-12 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {fileName || 'Document'}
                  </span>
                </div>
              )}
              <div className="w-full flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
                <span className="truncate max-w-[200px]">{fileName}</span>
                <button
                  type="button"
                  onClick={handleClearSelected}
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="w-full py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                {isConverting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isConverting
                    ? 'Processing file...'
                    : activeType === 'image'
                    ? 'Choose photo from your device'
                    : activeType === 'video'
                    ? 'Choose video from your device'
                    : 'Choose document from your device'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {activeType === 'image'
                    ? 'PNG, JPG, WebP, GIF (converted automatically)'
                    : activeType === 'video'
                    ? 'MP4, MOV, WebM up to 100MB'
                    : 'PDF, DOCX, ZIP, TXT'}
                </p>
              </div>
              <input
                type="file"
                accept={
                  activeType === 'image'
                    ? 'image/*'
                    : activeType === 'video'
                    ? 'video/*'
                    : '*/*'
                }
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>

        {/* Caption & Send */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/60 dark:bg-slate-950/60">
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add an optional caption..."
            className="flex-1 px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isUploading || (!selectedUrl && !selectedFile)}
            className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
