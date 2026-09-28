import React, { useState } from 'react';
import { Flag, X, ShieldAlert, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReportPostModalProps {
  isOpen: boolean;
  postId: string;
  authorUsername: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Spam, scam, or bot promotion',
  'Harassment, bullying, or hate speech',
  'Misinformation or harmful advice',
  'Inappropriate or sexually explicit media',
  'Violence, threats, or dangerous goods',
  'Copyright or intellectual property violation',
  'Something else'
];

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  isOpen,
  postId,
  authorUsername,
  onClose
}) => {
  const { reportPost } = useApp();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonPayload = additionalNotes.trim()
      ? `${selectedReason}: ${additionalNotes.trim()}`
      : selectedReason;
    reportPost(postId, reasonPayload);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="report-post-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="report-post-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Report Submitted
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Thank you for helping keep our community safe. Our team reviews all reports promptly.
            </p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Report Post
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Flagging content by @{authorUsername}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reasons Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{reason}</span>
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Optional details:
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="Provide context if needed..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
