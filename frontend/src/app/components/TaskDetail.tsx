'use client';

import { motion } from 'framer-motion';
import { Task } from '../types';
import { formatSol, formatDate, getTaskStatusColor, truncateAddress } from '../utils/program';
import {
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ListBulletIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface TaskDetailProps {
  task: Task;
}

export const TaskDetail = ({ task }: TaskDetailProps) => {
  const completedMilestones = task.milestones.filter(m => m.completed).length;
  const totalMilestones = task.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(task.status)}`>
            {task.status === 'InProgress' ? 'In Progress' : task.status}
          </span>
          <span className="text-slate-500 text-sm">
            Posted {formatDate(task.createdAt)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {task.title}
        </h1>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Posted by</p>
              <p className="text-slate-300">{truncateAddress(task.owner)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Deadline</p>
              <p className="text-slate-300">{formatDate(task.deadline)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">Total Budget</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{formatSol(task.budget)}</span>
              <span className="text-slate-400">SOL</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-slate-400 text-sm mb-1">Milestones</p>
            <p className="text-2xl font-semibold text-white">
              {completedMilestones}/{totalMilestones}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            />
          </div>
          <p className="text-slate-500 text-sm mt-2">
            {progress > 0 ? `${Math.round(progress)}% completed` : 'Not started yet'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 sm:p-8 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ListBulletIcon className="w-5 h-5 text-violet-400" />
          Description
        </h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
          {task.description}
        </p>
      </div>

      {/* Milestones */}
      <div className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          Milestones
        </h2>

        <div className="space-y-3">
          {task.milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${
                milestone.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-slate-800/30 border-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs font-medium text-slate-300">
                      {index + 1}
                    </span>
                    <h3 className="font-medium text-white">{milestone.description}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-9">
                    <div className="flex items-center gap-1.5">
                      <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-400">{formatSol(milestone.amount)} SOL</span>
                    </div>
                    
                    {milestone.paid && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        Paid ✓
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  {milestone.completed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                      <CheckCircleIcon className="w-4 h-4" />
                      Completed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700 text-slate-400 text-sm">
                      <ClockIcon className="w-4 h-4" />
                      Pending
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
