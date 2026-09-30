// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { LogOut, AlertTriangle, ShieldAlert, X, Flag, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatConversation } from '../types';

interface ExitGroupModalProps {
  conversation: ChatConversation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExitGroupModal: React.FC<ExitGroupModalProps> = ({
  conversation,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { exitGroup, currentUser } = useApp();

  if (!isOpen || !conversation) return null;

  const isOwner = conversation.ownerId === currentUser.id;
  const otherAdmins = (conversation.adminIds || []).filter(id => id !== currentUser.id);
  const otherMembers = (conversation.groupMembers || []).filter(m => m.id !== currentUser.id);

  const handleConfirmExit = () => {
    exitGroup(conversation.id);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div
      id="exit-group-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Exit "{conversation.groupName || conversation.participant.name}"?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to leave this group chat?
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p>• You will no longer receive messages or notifications from this group.</p>
          <p>• If the group is private, you will need an invite or admin approval to re-join.</p>
          {isOwner && (
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              ⚠️ You are the Group Owner. Exiting will automatically transfer ownership to{' '}
              {otherAdmins.length > 0 ? 'another group admin' : otherMembers.length > 0 ? 'the next senior group member' : 'nobody (group will close)'}.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-exit-group-btn"
            onClick={handleConfirmExit}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Group
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReportGroupModalProps {
  conversation: ChatConversation | null;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Inappropriate or adult content',
  'Harassment or hate speech',
  'Spam, scams, or commercial advertising',
  'Misinformation or fake news',
  'Violence or dangerous organizations',
  'Other violation of community guidelines'
];

export const ReportGroupModal: React.FC<ReportGroupModalProps> = ({
  conversation,
  isOpen,
  onClose
}) => {
  const { reportGroup } = useApp();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !conversation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportGroup(conversation.id, selectedReason, additionalDetails.trim());
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAdditionalDetails('');
      onClose();
    }, 1500);
  };

  return (
    <div
      id="report-group-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Report Submitted</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thank you for keeping our community safe. Our trust & moderation team will review this group within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Report Group
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                    {conversation.groupName || conversation.participant.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Reason for Reporting
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {REPORT_REASONS.map(reason => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === reason
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="accent-indigo-600"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalDetails}
                  onChange={e => setAdditionalDetails(e.target.value)}
                  placeholder="Provide context or specific messages that violate guidelines..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-report-group-btn"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
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
