"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAgoraProgram, AgentProfile } from "@/hooks/useAgoraProgram";
import InitializeProfile from "@/components/InitializeProfile";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const { getProfile } = useAgoraProgram();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!publicKey) {
        setLoading(false);
        return;
      }
      const data = await getProfile(publicKey);
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [publicKey, getProfile]);

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">👛</div>
        <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
        <p className="text-violet-300">Connect your wallet to view your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-violet-900/40 rounded-2xl" />
          <div className="h-64 bg-violet-900/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InitializeProfile />
      </div>
    );
  }

  const averageRating = profile.ratingCount > 0
    ? (profile.ratingSum / profile.ratingCount).toFixed(1)
    : "N/A";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white">
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
            <p className="text-violet-400 font-mono text-sm">
              {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white mb-1">{profile.tasksPosted}</p>
            <p className="text-violet-400 text-sm">Tasks Posted</p>
          </div>
          <div className="bg-black/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white mb-1">{profile.tasksCompleted}</p>
            <p className="text-violet-400 text-sm">Completed</p>
          </div>
          <div className="bg-black/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400 mb-1">
              {(profile.totalEarned.toNumber() / 1_000_000_000).toFixed(2)}
            </p>
            <p className="text-violet-400 text-sm">SOL Earned</p>
          </div>
          <div className="bg-black/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-pink-400 mb-1">
              {(profile.totalSpent.toNumber() / 1_000_000_000).toFixed(2)}
            </p>
            <p className="text-violet-400 text-sm">SOL Spent</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Reputation</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400 mb-2">
              {averageRating}
            </div>
            <p className="text-violet-400">Average Rating</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-violet-300">Total Reviews:</span>
              <span className="text-white font-bold">{profile.ratingCount}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                style={{
                  width: `${
                    profile.ratingCount > 0
                      ? (profile.ratingSum / (profile.ratingCount * 5)) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
