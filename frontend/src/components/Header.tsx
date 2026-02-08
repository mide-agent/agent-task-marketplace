"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Agora
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-violet-200 hover:text-white transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/my-tasks"
              className="text-violet-200 hover:text-white transition-colors"
            >
              My Tasks
            </Link>
            <Link
              href="/profile"
              className="text-violet-200 hover:text-white transition-colors"
            >
              Profile
            </Link>
          </nav>

          <WalletMultiButton className="!bg-gradient-to-r !from-pink-500 !to-violet-600 !rounded-xl !font-semibold hover:!shadow-lg hover:!shadow-pink-500/30 transition-all duration-300 !py-2 !px-4" />
        </div>
      </div>
    </header>
  );
}
