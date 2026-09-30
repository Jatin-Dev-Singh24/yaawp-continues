// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { FileText, Upload, X, FileCode, FileArchive, FileSpreadsheet, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DocumentAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendDocument: (doc: DocumentData, caption?: string) => void;
}

export const DocumentAttachmentModal: React.FC<DocumentAttachmentModalProps> = ({
  isOpen,
  onClose,
  onSendDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [caption, setCaption] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = parseFloat(sizeMb) > 0 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      const doc: DocumentData = {
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || 'Document',
        fileUrl: URL.createObjectURL(file),
      };
      setSelectedDoc(doc);
    }
  };

  const handleSend = () => {
    if (!selectedDoc) return;
    onSendDocument(selectedDoc, caption.trim());
    setSelectedDoc(null);
    setCaption('');
    onClose();
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
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Share Document
              </h3>
              <p className="text-[11px] text-slate-500">
                PDF, Word, Spreadsheet, Code or Archive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* File Upload Trigger */}
          {selectedDoc ? (
            <div className="p-4 rounded-2xl border border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  {getDocIcon(selectedDoc.fileName)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {selectedDoc.fileName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {selectedDoc.fileSize} • {selectedDoc.fileType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg"
                title="Remove document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose file from your device
              </span>
              <span className="text-[10px] text-slate-400">PDF, DOCX, XLSX, ZIP up to 50MB</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          {/* Optional Caption */}
          {selectedDoc && (
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Message caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Add note for this document..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!selectedDoc}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
          >
            Send Document
          </button>
        </div>
      </motion.div>
    </div>
  );
};
