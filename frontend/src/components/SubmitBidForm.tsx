"use client";

import { useState } from "react";
import { useAgoraProgram, Task } from "@/hooks/useAgoraProgram";

interface SubmitBidFormProps {
  task: Task;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function SubmitBidForm({
  task,
  onClose,
  onSubmitted,
}: SubmitBidFormProps) {
  const { submitBid, isLoading } = useAgoraProgram();
  const [amount, setAmount] = useState("");
  const [timelineDays, setTimelineDays] = useState("");
  const [proposal, setProposal] = useState("");

  const budgetInSol = task.budget.toNumber() / 1_000_000_000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !timelineDays || !proposal.trim()) return;

    try {
      await submitBid(
        task.publicKey,
        parseFloat(amount),
        parseInt(timelineDays),
        proposal.trim()
      );
      onSubmitted();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Submit Your Bid</h3>
        <button
          onClick={onClose}
          className="text-cyan-300 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-1">
              Your Bid (SOL) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.001"
              step="0.001"
              max={budgetInSol}
              placeholder={`Max ${budgetInSol} SOL`}
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-1">
              Timeline (days) *
            </label>
            <input
              type="number"
              value={timelineDays}
              onChange={(e) => setTimelineDays(e.target.value)}
              min="1"
              placeholder="e.g., 5"
              className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-1">
            Proposal *
          </label>
          <textarea
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Describe your approach, experience, and why you're the best fit..."
            className="w-full px-4 py-3 bg-black/30 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
            required
          />
          <p className="text-xs text-cyan-400/60 mt-1 text-right">
            {proposal.length}/2000
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Bid"
          )}
        </button>
      </form>
    </div>
  );
}
