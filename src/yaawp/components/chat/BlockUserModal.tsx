// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ban, ShieldAlert, AlertTriangle, Check } from 'lucide-react';
import { UserSummary } from '../../types';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSummary | null;
  onBlock: (userId: string) => void;
  onBlockAndReport: (userId: string, reason: string, details?: string) => void;
}

const REPORT_REASONS = [
  'Spam, scams, or commercial solicitation',
  'Harassment, hate speech, or bullying',
  'Inappropriate or offensive content',
  'Impersonation or fake profile',
  'Suspicious activity or compromised account',
  'Other violation of Community Guidelines'
];

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onBlock,
  onBlockAndReport
}) => {
  const [actionType, setActionType] = useState<'block' | 'block_and_report'>('block');
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'block') {
      onBlock(user.id);
    } else {
      onBlockAndReport(user.id, selectedReason, additionalDetails.trim() || undefined);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Block @{user.username}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select your preferred moderation action
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User preview banner */}
          <div className="px-5 pt-4 pb-1">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </span>
                  {user.isVerified && (
                    <span className="text-[10px] text-indigo-500 font-bold">✓</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          {/* Body Options */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                What would you like to do?
              </label>

              {/* Option 1: Block */}
              <div
                onClick={() => setActionType('block')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                  actionType === 'block'
                    ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/20 ring-1 ring-rose-500/50'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  actionType === 'block' ? 'border-rose-600 bg-rose-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {actionType === 'block' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Block
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Prevent @{user.username} from sending you messages or seeing your profile. They will not be notified.
                  </p>
                </div>
              </div>

              {/* Option 2: Block & Report */}
              <div
                onClick={() => setActionType('block_and_report')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                  actionType === 'block_and_report'
                    ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/20 ring-1 ring-rose-500/50'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  actionType === 'block_and_report' ? 'border-rose-600 bg-rose-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {actionType === 'block_and_report' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Block & Report
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Block this user and immediately submit a report with their recent messages to our trust and safety moderation team.
                  </p>
                </div>
              </div>
            </div>

            {/* If Block & Report is active, show reasons and optional note */}
            {actionType === 'block_and_report' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select a reason for reporting
                  </label>
                  <div className="space-y-1">
                    {REPORT_REASONS.map(reason => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setSelectedReason(reason)}
                        className={`w-full text-left p-2 px-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          selectedReason === reason
                            ? 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-medium'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{reason}</span>
                        {selectedReason === reason && (
                          <Check className="w-3.5 h-3.5 text-rose-600 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Additional context (optional)
                  </label>
                  <textarea
                    value={additionalDetails}
                    onChange={e => setAdditionalDetails(e.target.value)}
                    placeholder="Provide any additional context or incident details..."
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {actionType === 'block' ? (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Block & Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
