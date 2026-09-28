import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (text: string, scheduledForMs: number) => void;
  initialText?: string;
  recipientName: string;
}

export const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  initialText = '',
  recipientName
}) => {
  const [text, setText] = useState(initialText);

  // Initialize with a time 1 hour in the future
  const getInitialDateTime = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return { date: dateStr, time: `${hours}:${minutes}` };
  };

  const [date, setDate] = useState(() => getInitialDateTime().date);
  const [time, setTime] = useState(() => getInitialDateTime().time);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      const init = getInitialDateTime();
      setDate(init.date);
      setTime(init.time);
      setError(null);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const getTargetMs = (targetDate: string, targetTime: string) => {
    const [y, m, d] = targetDate.split('-').map(Number);
    const [h, min] = targetTime.split(':').map(Number);
    const target = new Date(y, m - 1, d, h, min, 0, 0);
    return target.getTime();
  };

  const setPreset = (offsetMinutes: number) => {
    const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setDate(dateStr);
    setTime(`${hours}:${minutes}`);
    setError(null);
  };

  const setTomorrowAt = (hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    const hours = String(hour).padStart(2, '0');
    setDate(dateStr);
    setTime(`${hours}:00`);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter a message to schedule.');
      return;
    }

    const scheduledMs = getTargetMs(date, time);
    if (isNaN(scheduledMs) || scheduledMs <= Date.now()) {
      setError('Please choose a time in the future.');
      return;
    }

    onSchedule(text.trim(), scheduledMs);
    onClose();
  };

  const scheduledMs = getTargetMs(date, time);
  const isFuture = !isNaN(scheduledMs) && scheduledMs > Date.now();
  const minutesUntil = isFuture ? Math.round((scheduledMs - Date.now()) / (60 * 1000)) : 0;
  const hoursUntil = (minutesUntil / 60).toFixed(1);

  return (
    <div
      id="schedule-message-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Schedule Message
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To {recipientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Message Content
            </label>
            <textarea
              value={text}
              onChange={e => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder={`Write message for ${recipientName}...`}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Quick Timing
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPreset(15)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 transition-colors"
              >
                In 15 mins
              </button>
              <button
                type="button"
                onClick={() => setPreset(60)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 transition-colors"
              >
                In 1 hour
              </button>
              <button
                type="button"
                onClick={() => setTomorrowAt(9)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tomorrow 9:00 AM
              </button>
              <button
                type="button"
                onClick={() => setTomorrowAt(18)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tomorrow 6:00 PM
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  setDate(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={e => {
                  setTime(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Timing preview / calculation */}
          {isFuture && (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300">
              <span className="font-medium">
                Scheduled for {new Date(scheduledMs).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                {new Date(scheduledMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[11px] font-bold opacity-80">
                {minutesUntil < 60 ? `in ~${minutesUntil}m` : `in ~${hoursUntil}h`}
              </span>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || !isFuture}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              Schedule Message
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
