"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAgoraProgram, Task, Bid } from "@/hooks/useAgoraProgram";
import { PublicKey } from "@solana/web3.js";

interface BidListProps {
  task: Task;
  bids: Bid[];
  isOwner: boolean;
  onBidUpdate: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "⏳ Pending",
  accepted: "✅ Accepted",
  rejected: "❌ Rejected",
  withdrawn: "🚫 Withdrawn",
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BidCard({
  bid,
  task,
  isOwner,
  isAccepted,
  onUpdate,
}: {
  bid: Bid;
  task: Task;
  isOwner: boolean;
  isAccepted: boolean;
  onUpdate: () => void;
}) {
  const { publicKey } = useWallet();
  const { acceptBid, rejectBid, withdrawBid, isLoading } = useAgoraProgram();
  const [actionLoading, setActionLoading] = useState<
    "accept" | "reject" | "withdraw" | null
  >(null);

  const isBidder = publicKey?.toString() === bid.bidder.toString();
  const amountInSol = bid.amount.toNumber() / 1_000_000_000;
  const timelineDays = Math.ceil(bid.timeline.toNumber() / (24 * 60 * 60));

  const handleAccept = async () => {
    if (!confirm("Accept this bid? This will lock in the freelancer.")) return;
    setActionLoading("accept");
    try {
      await acceptBid(task.publicKey, bid.publicKey);
      onUpdate();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm("Reject this bid?")) return;
    setActionLoading("reject");
    try {
      await rejectBid(task.publicKey, bid.publicKey);
      onUpdate();
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Withdraw your bid?")) return;
    setActionLoading("withdraw");
    try {
      await withdrawBid(bid.publicKey);
      onUpdate();
    } finally {
      setActionLoading(null);
    }
  };

  const showActions =
    task.status === "open" && bid.status === "pending" && !isAccepted;

  return (
    <div
      className={`bg-black/20 rounded-2xl p-5 border ${
        isAccepted
          ? "border-green-500/40 bg-green-500/5"
          : "border-violet-500/20"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-bold">
            {shortenAddress(bid.bidder.toString())[0]}
          </div>
          <div>
            <p className="text-white font-mono text-sm">
              {shortenAddress(bid.bidder.toString())}
            </p>
            {isBidder && (
              <span className="text-xs text-pink-400">You</span>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            statusColors[bid.status] || statusColors.pending
          }`}
        >
          {statusLabels[bid.status] || bid.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/30 rounded-xl p-3">
          <p className="text-xs text-violet-400 mb-1">Bid Amount</p>
          <p className="text-xl font-bold text-cyan-400">
            {amountInSol.toFixed(2)} SOL
          </p>
        </div>
        <div className="bg-black/30 rounded-xl p-3">
          <p className="text-xs text-violet-400 mb-1">Timeline</p>
          <p className="text-xl font-bold text-white">{timelineDays} days</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-violet-400 mb-1">Proposal</p>
        <p className="text-violet-100 text-sm whitespace-pre-wrap">
          {bid.proposal}
        </p>
      </div>

      <p className="text-xs text-violet-500 mb-3">
        Submitted {formatDate(bid.createdAt.toNumber())}
      </p>

      {showActions && (
        <div className="flex gap-2">
          {isOwner && (
            <>
              <button
                onClick={handleAccept}
                disabled={actionLoading !== null}
                className="flex-1 py-2 px-4 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading === "accept" ? "Accepting..." : "✓ Accept"}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading === "reject" ? "Rejecting..." : "✕ Reject"}
              </button>
            </>
          )}
          {isBidder && (
            <button
              onClick={handleWithdraw}
              disabled={actionLoading !== null}
              className="w-full py-2 px-4 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors font-medium disabled:opacity-50"
            >
              {actionLoading === "withdraw" ? "Withdrawing..." : "Withdraw Bid"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function BidList({
  task,
  bids,
  isOwner,
  onBidUpdate,
}: BidListProps) {
  const acceptedBid = bids.find((b) => b.status === "accepted");

  if (bids.length === 0) {
    return (
      <div className="bg-violet-900/20 rounded-2xl p-8 text-center border border-violet-500/20">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-white mb-1">No bids yet</h3>
        <p className="text-violet-400 text-sm">Be the first to submit a bid!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">
        💼 Bids ({bids.length})
      </h3>
      <div className="space-y-4">
        {bids.map((bid) => (
          <BidCard
            key={bid.publicKey.toString()}
            bid={bid}
            task={task}
            isOwner={isOwner}
            isAccepted={
              acceptedBid?.publicKey.toString() === bid.publicKey.toString()
            }
            onUpdate={onBidUpdate}
          />
        ))}
      </div>
    </div>
  );
}
