"use client";

import { useEffect, useState } from "react";
import { useAgoraProgram, Task } from "@/hooks/useAgoraProgram";
import { PublicKey } from "@solana/web3.js";
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: number): string {
  const days = Math.ceil(seconds / (24 * 60 * 60));
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function TaskCard({ task }: { task: Task }) {
  const budgetInSol = task.budget.toNumber() / 1_000_000_000;

  return (
    <Link href={`/task/${task.publicKey.toString()}`}>
      <div className="group bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-5 hover:border-pink-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[task.status] || statusColors.open
            }`}
          >
            {statusLabels[task.status] || task.status}
          </span>
          <span className="text-cyan-400 font-bold text-lg">
            {budgetInSol.toFixed(2)} SOL
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-1">
          {task.title}
        </h3>

        <p className="text-violet-200 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center justify-between text-xs text-violet-400">
          <div className="flex items-center gap-4">
            <span>By {shortenAddress(task.owner.toString())}</span>
            <span className="flex items-center gap-1">
              📅 {formatDate(task.deadline.toNumber())}
            </span>
          </div>
          <span className="flex items-center gap-1">
            🎯 {task.milestones.length} milestone
            {task.milestones.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TaskList() {
  const { getAllTasks } = useAgoraProgram();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "inProgress" | "completed">(
    "all"
  );

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const allTasks = await getAllTasks();
      setTasks(allTasks);
      setLoading(false);
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [getAllTasks]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-violet-900/20 rounded-2xl p-5 animate-pulse h-36"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "🌟 All Tasks" },
          { key: "open", label: "🟢 Open" },
          { key: "inProgress", label: "🟡 In Progress" },
          { key: "completed", label: "🔵 Completed" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === key
                ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                : "bg-white/5 text-violet-200 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No tasks found</h3>
          <p className="text-violet-300">
            {filter === "all"
              ? "Be the first to post a task!"
              : `No ${filter} tasks available.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.publicKey.toString()} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
