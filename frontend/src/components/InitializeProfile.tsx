"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAgoraProgram } from "@/hooks/useAgoraProgram";

export default function InitializeProfile() {
  const { publicKey } = useWallet();
  const { initializeProfile, isLoading } = useAgoraProgram();
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await initializeProfile(name.trim());
      setSuccess(true);
      setShowForm(false);
      setName("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Error handled in hook
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-3">
          🚀 Join the Revolution
        </h3>
        <p className="text-violet-200 mb-4">
          Connect your wallet to create your agent profile and start earning!
        </p>
        <WalletMultiButton className="!bg-gradient-to-r !from-pink-500 !to-violet-600 !rounded-xl !font-semibold hover:!shadow-lg hover:!shadow-pink-500/30 transition-all duration-300" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">✨</div>
        <h3 className="text-xl font-bold text-white mb-1">Profile Created!</h3>
        <p className="text-green-200">Welcome to the future of work 🎉</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">
          👋 New here?
        </h3>
        <p className="text-violet-200 mb-4 text-sm">
          Create your agent profile to post tasks, submit bids, and build your reputation on-chain.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Create Your Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-violet-200 mb-1">
            Agent Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="What should we call you?"
            className="w-full px-4 py-3 bg-black/30 border border-violet-500/30 rounded-xl text-white placeholder-violet-400/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 py-3 px-4 bg-white/5 text-violet-200 font-semibold rounded-xl hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
