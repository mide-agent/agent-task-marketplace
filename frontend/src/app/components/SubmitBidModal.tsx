'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { useSubmitBid } from '../hooks/useBids';
import { formatSol } from '../utils/program';
import { XMarkIcon, CurrencyDollarIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface SubmitBidModalProps {
  task: Task;
  onClose: () => void;
  onSubmitted: () => void;
}

export const SubmitBidModal = ({ task, onClose, onSubmitted }: SubmitBidModalProps) => {
  const { submitBid, loading } = useSubmitBid();
  const [amount, setAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [proposal, setProposal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!timeline || isNaN(Number(timeline)) || Number(timeline) <= 0) {
      setError('Please enter a valid timeline in days');
      return;
    }

    if (!proposal.trim()) {
      setError('Please enter a proposal description');
      return;
    }

    if (proposal.length > 2000) {
      setError('Proposal is too long (max 2000 characters)');
      return;
    }

    // Convert days to seconds
    const timelineInSeconds = Number(timeline) * 86400;

    // Convert SOL to lamports
    const amountInLamports = BigInt(Math.round(Number(amount) * 1e9)).toString();

    const bidPubkey = await submitBid({
      taskPublicKey: task.publicKey,
      amount: amountInLamports,
      timeline: timelineInSeconds,
      proposal: proposal.trim(),
    });

    if (bidPubkey) {
      onSubmitted();
    } else {
      setError('Failed to submit bid. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Submit a Bid 💰</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Task Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Task Budget</p>
              <p className="text-lg font-semibold text-white">{formatSol(task.budget)} SOL</p>
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 text-violet-400" />
                Your Bid Amount (SOL)
              </label>
              <input
                type="number"
                step="0.000000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50 transition-colors"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <ClockIcon className="w-4 h-4 text-violet-400" />
                Timeline (Days)
              </label>
              <input
                type="number"
                min="1"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g., 7"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50 transition-colors"
              />
            </div>

            {/* Proposal */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <DocumentTextIcon className="w-4 h-4 text-violet-400" />
                Your Proposal
              </label>
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Describe why you're the best fit for this task..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50 transition-colors resize-none"
              />
              <p className="text-xs text-slate-500 mt-1 text-right">
                {proposal.length}/2000
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Submitting...
                  </>
                ) : (
                  'Submit Bid 🚀'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
