"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAgoraProgram } from "@/hooks/useAgoraProgram";
import { LAMPORTS_PER_SOL } from "@/lib/constants";

interface MilestoneInput {
  description: string;
  amount: string;
}

export default function PostTaskForm() {
  const { publicKey } = useWallet();
  const { postTask, isLoading } = useAgoraProgram();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("7");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: "", amount: "" },
  ]);
  const [success, setSuccess] = useState(false);

  const addMilestone = () => {
    if (milestones.length < 10) {
      setMilestones([...milestones, { description: "", amount: "" }]);
    }
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (
    index: number,
    field: keyof MilestoneInput,
    value: string
  ) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const totalMilestoneAmount = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  );

  const budgetNum = parseFloat(budget) || 0;
  const amountsMatch = Math.abs(totalMilestoneAmount - budgetNum) < 0.0001;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !amountsMatch) return;

    try {
      const milestoneData = milestones.map((m) => ({
        description: m.description,
        amount: parseFloat(m.amount),
      }));

      await postTask(
        title.trim(),
        description.trim(),
        parseFloat(budget),
        milestoneData,
        parseInt(deadlineDays)
      );

      setSuccess(true);
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadlineDays("7");
      setMilestones([{ description: "", amount: "" }]);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch {
      // Error handled in hook
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gradient-to-r from-pink-500/20 via-violet-500/20 to-cyan-500/20 rounded-2xl p-8 text-center border border-white/10">
        <p className="text-violet-200">Connect your wallet to post a task</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-2xl font-bold text-white mb-2">Task Posted!</h3>
        <p className="text-green-200">Your task is now live on the marketplace</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 text-white font-bold text-lg rounded-2xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 transform hover:scale-[1.02]"
      >
        ✨ Post a New Task
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Post a Task</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-violet-300 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-violet-200 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g., Build a Solana dApp frontend"
            className="w-full px-4 py-3 bg-black/30 border border-violet-500/30 rounded-xl text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-violet-200 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            rows={4}
            placeholder="Describe what you need..."
            className="w-full px-4 py-3 bg-black/30 border border-violet-500/30 rounded-xl text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-violet-200 mb-1">
              Budget (SOL) *
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0.001"
              step="0.001"
              placeholder="1.5"
              className="w-full px-4 py-3 bg-black/30 border border-violet-500/30 rounded-xl text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-violet-200 mb-1">
              Deadline (days) *
            </label>
            <input
              type="number"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              min="1"
              max="365"
              className="w-full px-4 py-3 bg-black/30 border border-violet-500/30 rounded-xl text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-violet-200">
              Milestones *
            </label>
            <button
              type="button"
              onClick={addMilestone}
              disabled={milestones.length >= 10}
              className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
            >
              + Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="bg-black/20 rounded-xl p-4 border border-violet-500/20"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={milestone.description}
                    onChange={(e) =>
                      updateMilestone(index, "description", e.target.value)
                    }
                    placeholder={`Milestone ${index + 1} description`}
                    className="flex-1 px-3 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 text-sm"
                    required
                  />
                  <input
                    type="number"
                    value={milestone.amount}
                    onChange={(e) =>
                      updateMilestone(index, "amount", e.target.value)
                    }
                    min="0"
                    step="0.001"
                    placeholder="SOL"
                    className="w-24 px-3 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 text-sm"
                    required
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className={amountsMatch ? "text-green-400" : "text-amber-400"}>
              Milestones Total: {totalMilestoneAmount.toFixed(3)} SOL
            </span>
            {!amountsMatch && budgetNum > 0 && (
              <span className="text-red-400">
                Must equal budget ({budgetNum.toFixed(3)} SOL)
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !amountsMatch}
          className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Posting...
            </span>
          ) : (
            "Post Task"
          )}
        </button>
      </form>
    </div>
  );
}
