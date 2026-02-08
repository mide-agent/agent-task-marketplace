"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAgoraProgram, Task, Bid } from "@/hooks/useAgoraProgram";
import Link from "next/link";

const statusColors: Record<string, string> = {
  open: "bg-green-500/20 text-green-400 border-green-500/30",
  inProgress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  disputed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  inProgress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function MyTasksPage() {
  const { publicKey } = useWallet();
  const { getAllTasks, getBidsForTask } = useAgoraProgram();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<(Task & { bidStatus: string; bidAmount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posted" | "bids">("posted");

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) return;
      setLoading(true);

      const allTasks = await getAllTasks();
      
      // Posted tasks
      const posted = allTasks.filter(
        (t) => t.owner.toString() === publicKey.toString()
      );
      setPostedTasks(posted);

      // Tasks I've bid on
      const tasksWithMyBids: (Task & { bidStatus: string; bidAmount: number })[] = [];
      
      for (const task of allTasks) {
        const bids = await getBidsForTask(task.publicKey);
        const myBid = bids.find((b) => b.bidder.toString() === publicKey.toString());
        if (myBid) {
          tasksWithMyBids.push({
            ...task,
            bidStatus: myBid.status,
            bidAmount: myBid.amount.toNumber() / 1_000_000_000,
          });
        }
      }
      setMyBids(tasksWithMyBids);

      setLoading(false);
    };

    fetchData();
  }, [publicKey, getAllTasks, getBidsForTask]);

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">👛</div>
        <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
        <p className="text-violet-300">Connect your wallet to view your tasks</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-violet-900/40 rounded w-1/4" />
          <div className="h-32 bg-violet-900/40 rounded" />
          <div className="h-32 bg-violet-900/40 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Tasks</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("posted")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "posted"
              ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
              : "bg-white/5 text-violet-200 hover:bg-white/10"
          }`}
        >
          Posted ({postedTasks.length})
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "bids"
              ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
              : "bg-white/5 text-violet-200 hover:bg-white/10"
          }`}
        >
          My Bids ({myBids.length})
        </button>
      </div>

      {activeTab === "posted" && (
        <div className="space-y-4">
          {postedTasks.length === 0 ? (
            <div className="text-center py-12 bg-violet-900/20 rounded-2xl">
              <p className="text-violet-300 mb-4">You haven&apos;t posted any tasks yet</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-medium"
              >
                Post Your First Task
              </Link>
            </div>
          ) : (
            postedTasks.map((task) => (
              <Link
                key={task.publicKey.toString()}
                href={`/task/${task.publicKey.toString()}`}
              >
                <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-5 hover:border-pink-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            statusColors[task.status]
                          }`}
                        >
                          {statusLabels[task.status]}
                        </span>
                        <span className="text-cyan-400 font-bold">
                          {(task.budget.toNumber() / 1_000_000_000).toFixed(2)} SOL
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{task.title}</h3>
                    </div>
                    <span className="text-violet-400 text-sm">
                      Due {formatDate(task.deadline.toNumber())}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "bids" && (
        <div className="space-y-4">
          {myBids.length === 0 ? (
            <div className="text-center py-12 bg-violet-900/20 rounded-2xl">
              <p className="text-violet-300 mb-4">You haven&apos;t submitted any bids yet</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-medium"
              >
                Browse Tasks
              </Link>
            </div>
          ) : (
            myBids.map((task) => (
              <Link
                key={task.publicKey.toString()}
                href={`/task/${task.publicKey.toString()}`}
              >
                <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-5 hover:border-pink-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            statusColors[task.status]
                          }`}
                        >
                          {statusLabels[task.status]}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.bidStatus === "accepted"
                              ? "bg-green-500/20 text-green-400"
                              : task.bidStatus === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          Your bid: {task.bidStatus}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{task.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">
                        {task.bidAmount.toFixed(2)} SOL
                      </p>
                      <p className="text-violet-400 text-sm">Your bid</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
