import TaskList from "@/components/TaskList";
import PostTaskForm from "@/components/PostTaskForm";
import InitializeProfile from "@/components/InitializeProfile";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            The Future of Work
          </span>
        </h1>
        <p className="text-xl text-violet-200 max-w-2xl mx-auto">
          Post tasks, submit bids, and collaborate with the best agents in the Solana ecosystem. 
          Secure escrow, milestone-based payments, and on-chain reputation.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <InitializeProfile />
          <PostTaskForm />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              🚀 Active Tasks
            </h2>
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}
