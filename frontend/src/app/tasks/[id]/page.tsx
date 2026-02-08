'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTask, useCreateTask } from '../../hooks/useProgram';
import { useBids, useSubmitBid, useAcceptBid, useRejectBid } from '../../hooks/useBids';
import { Task, Bid } from '../../types';
import { TaskDetail } from '../../components/TaskDetail';
import { BidCard } from '../../components/BidCard';
import { SubmitBidModal } from '../../components/SubmitBidModal';
import { PageLoader } from '../../components/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../../components/ErrorMessage';
import { ArrowLeftIcon, PlusIcon, InboxIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TaskDetailPage() {
  const params = useParams();
  const { publicKey } = useWallet();
  const taskId = params.id as string;
  
  const { fetchTask, loading: taskLoading } = useTask();
  const { fetchBidsByTask } = useBids();
  const { acceptBid, loading: acceptLoading } = useAcceptBid();
  const { rejectBid, loading: rejectLoading } = useRejectBid();
  
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      loadTaskData();
    }
  }, [taskId]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const taskPubkey = new PublicKey(taskId);
      const [fetchedTask, fetchedBids] = await Promise.all([
        fetchTask(taskPubkey),
        fetchBidsByTask(taskPubkey),
      ]);
      
      if (fetchedTask) {
        setTask(fetchedTask);
        setBids(fetchedBids);
      } else {
        setError('Task not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidPublicKey: PublicKey) => {
    if (!task) return;
    
    const success = await acceptBid({
      taskPublicKey: task.publicKey,
      bidPublicKey,
    });
    
    if (success) {
      await loadTaskData();
    }
  };

  const handleRejectBid = async (bidPublicKey: PublicKey) => {
    if (!task) return;
    
    const success = await rejectBid(task.publicKey, bidPublicKey);
    
    if (success) {
      await loadTaskData();
    }
  };

  const handleBidSubmitted = () => {
    setShowBidModal(false);
    loadTaskData();
  };

  if (loading || taskLoading) return <PageLoader />;
  
  if (error || !task) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/tasks" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tasks
          </Link>
          <ErrorMessage message={error || 'Task not found'} onRetry={loadTaskData} />
        </div>
      </div>
    );
  }

  const isOwner = publicKey?.equals(task.owner);
  const hasBid = bids.some(b => b.bidder.equals(publicKey!));
  const canBid = !isOwner && task.status === 'Open' && !hasBid;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link href="/tasks" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tasks
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Task Detail */}
          <div className="lg:col-span-2">
            <TaskDetail task={task} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    You posted this task. Review bids and manage milestones here.
                  </p>
                </div>
              ) : canBid ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBidModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Submit a Bid
                </motion.button>
              ) : hasBid ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm">✅ You've already submitted a bid on this task!</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-slate-400 text-sm">🔒 Bidding is closed for this task.</p>
                </div>
              )}
            </motion.div>

            {/* Bids Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Bids</h3>
                <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                  {bids.length}
                </span>
              </div>

              <div className="space-y-4">
                {bids.length > 0 ? (
                  bids.map((bid, index) => (
                    <BidCard
                      key={bid.publicKey.toBase58()}
                      bid={bid}
                      isOwner={isOwner || false}
                      onAccept={handleAcceptBid}
                      onReject={handleRejectBid}
                      index={index}
                      loading={acceptLoading || rejectLoading}
                    />
                  ))
                ) : (
                  <EmptyState
                    message="No bids yet. Be the first to submit one! 🚀"
                    icon={InboxIcon}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Submit Bid Modal */}
      {showBidModal && task && (
        <SubmitBidModal
          task={task}
          onClose={() => setShowBidModal(false)}
          onSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  );
}
