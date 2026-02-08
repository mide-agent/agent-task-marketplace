"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useAgoraProgram, Task, Bid } from "@/hooks/useAgoraProgram";
import SubmitBidForm from "./SubmitBidForm";
import BidList from "./BidList";
import Link from "next/link";

const statusColors: Record<string, string> = {
  open: "bg-green-500/20 text-green-400 border-green-500/30",
  inProgress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  disputed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const statusLabels: Record<string, string> = {
  open: "🟢 Open",
  inProgress: "🟡 In Progress",
  completed: "🔵 Completed",
  cancelled: "🔴 Cancelled",
  disputed: "🟣 Disputed",
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface TaskDetailProps {
  taskPDA: string;
}

export default function TaskDetail({ taskPDA }: TaskDetailProps) {
  const { publicKey } = useWallet();
  const { getTask, getBidsForTask, cancelTask } = useAgoraProgram();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const taskPublicKey = new PublicKey(taskPDA);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [taskData, bidsData] = await Promise.all([
        getTask(taskPublicKey),
        getBidsForTask(taskPublicKey),
      ]);
      setTask(taskData);
      setBids(bidsData);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [taskPDA, getTask, getBidsForTask]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this task?")) return;
    setCancelling(true);
    try {
      await cancelTask(taskPublicKey);
      const updated = await getTask(taskPublicKey);
      setTask(updated);
    } finally {
      setCancelling(false);
    }
  };

  const isOwner = publicKey && task?.owner.toString() === publicKey.toString();
  const budgetInSol = task ? task.budget.toNumber() / 1_000_000_000 : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-violet-900/40 rounded w-3/4" />
          <div className="h-4 bg-violet-900/40 rounded w-1/2" />
          <div className="h-32 bg-violet-900/40 rounded" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">❓</div>
        <h1 className="text-3xl font-bold text-white mb-4">Task Not Found</h1>
        <Link
          href="/"
          className="text-pink-400 hover:text-pink-300 transition-colors"
        >
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-violet-300 hover:text-white mb-6 transition-colors"
      >
        ← Back to Tasks
      </Link>

      <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${
                statusColors[task.status] || statusColors.open
              }`}
            >
              {statusLabels[task.status] || task.status}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {task.title}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">
              {budgetInSol.toFixed(2)} SOL
            </div>
            <div className="text-sm text-violet-300">
              Budget
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-violet-300 mb-6 pb-6 border-b border-violet-500/20">
          <div className="flex items-center gap-2">
            <span className="text-violet-400">Posted by:</span>
            <span className="text-white font-mono">
              {shortenAddress(task.owner.toString())}
            </span>
            {isOwner && (
              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">Deadline:</span>
            <span className="text-white">
              {formatDate(task.deadline.toNumber())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">Created:</span>
            <span className="text-white">
              {formatDate(task.createdAt.toNumber())}
            </span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-8">
          <h3 className="text-lg font-semibold text-violet-200 mb-3">
            Description
          </h3>
          <p className="text-violet-100 whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-violet-200 mb-4">
            📋 Milestones ({task.milestones.length})
          </h3>
          <div className="space-y-3">
            {task.milestones.map((milestone, index) => {
              const amountInSol = milestone.amount.toNumber() / 1_000_000_000;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    milestone.completed
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-black/20 border-violet-500/20"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      milestone.completed
                        ? "bg-green-500 text-white"
                        : "bg-violet-600 text-white"
                    }`}
                  >
                    {milestone.completed ? "✓" : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{milestone.description}</p>
                    <p className="text-sm text-violet-400">
                      {amountInSol.toFixed(3)} SOL
                      {milestone.paid && (
                        <span className="ml-2 text-green-400">✓ Paid</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isOwner && task.status === "open" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-red-300">Want to cancel this task?</span>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Task"}
            </button>
          </div>
        </div>
      )}

      {task.status === "open" && !isOwner && publicKey && (
        <div className="mb-6">
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 text-white font-bold text-lg rounded-2xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
            >
              💰 Submit a Bid
            </button>
          ) : (
            <SubmitBidForm
              task={task}
              onClose={() => setShowBidForm(false)}
              onSubmitted={() => {
                setShowBidForm(false);
                getBidsForTask(taskPublicKey).then(setBids);
              }}
            />
          )}
        </div>
      )}

      <BidList
        task={task}
        bids={bids}
        isOwner={isOwner}
        onBidUpdate={() => getBidsForTask(taskPublicKey).then(setBids)}
      />
    </div>
  );
}
