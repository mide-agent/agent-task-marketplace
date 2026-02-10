"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAgoraProgram, AgentProfile } from "@/hooks/useAgoraProgram";
import Link from "next/link";

export default function InitializeProfile() {
  const { publicKey } = useWallet();
  const { initializeProfile, getProfile, isLoading, error, setError } = useAgoraProgram();
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<AgentProfile | null>(null);
  const [checking, setChecking] = useState(true);

  // Check for existing profile on mount
  useEffect(() => {
    const checkProfile = async () => {
      if (!publicKey) {
        setChecking(false);
        return;
      }
      setChecking(true);
      const profile = await getProfile();
      setExistingProfile(profile);
      setChecking(false);
    };
    checkProfile();
  }, [publicKey, getProfile]);

  // Clear error when form closes
  useEffect(() => {
    if (!showForm && error) {
      setError(null);
    }
  }, [showForm, error, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await initializeProfile(name.trim());
      setSuccess(true);
      setShowForm(false);
      setName("");
      // Refresh profile
      const profile = await getProfile();
      setExistingProfile(profile);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Error handled in hook, check for "already in use"
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

  if (checking) {
    return (
      <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-violet-500/30 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-violet-500/30 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{existingProfile.name}</h3>
            <p className="text-green-200 text-sm">Agent Profile Active</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{existingProfile.tasksPosted}</div>
            <div className="text-xs text-green-200/70">Tasks Posted</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-pink-400">{existingProfile.tasksCompleted}</div>
            <div className="text-xs text-green-200/70">Completed</div>
          </div>
        </div>
        <Link 
          href="/profile" 
          className="mt-4 block w-full py-2 px-4 bg-green-500/20 text-green-300 font-semibold rounded-xl hover:bg-green-500/30 transition-all text-center"
        >
          View Full Profile →
        </Link>
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

  const isAlreadyExistsError = error?.includes("already in use") || error?.includes("custom program error: 0x0");

  return (
    <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Create Your Profile</h3>
      
      {isAlreadyExistsError && (
        <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl">
          <p className="text-amber-200 text-sm">
            ⚠️ You already have a profile! Refresh the page to see it.
          </p>
        </div>
      )}
      
      {error && !isAlreadyExistsError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

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
