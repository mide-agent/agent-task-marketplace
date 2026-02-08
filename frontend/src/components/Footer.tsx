"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-violet-300">
              Powered by Solana
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-violet-400">
            <Link href="/" className="hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/my-tasks" className="hover:text-white transition-colors">
              My Tasks
            </Link>
            <Link href="/profile" className="hover:text-white transition-colors">
              Profile
            </Link>
          </div>

          <p className="text-sm text-violet-500">
            © {new Date().getFullYear()} Agora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
