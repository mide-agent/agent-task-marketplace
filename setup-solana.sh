#!/bin/bash

# Solana Dev Environment Setup for Mac
# Run this script to install Solana CLI, Anchor, and Rust

set -e

echo "🔧 Setting up Solana development environment..."

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust already installed: $(rustc --version)"
fi

# Install Solana CLI
echo "📦 Installing Solana CLI..."
curl -sSfL https://release.anza.xyz/stable/install | sh

# Add to PATH for this session
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
echo ""
echo "✅ Solana CLI installed:"
solana --version

# Install Anchor
echo ""
echo "📦 Installing Anchor..."
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli

# Verify installation
echo ""
echo "✅ Anchor installed:"
anchor --version

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your terminal or run: source ~/.zshrc (or ~/.bashrc)"
echo "2. cd agent-task-marketplace"
echo "3. anchor build"
echo ""
echo "For devnet deployment:"
echo "  solana config set --url devnet"
echo "  solana-keygen new --outfile ~/.config/solana/devnet.json"
echo "  solana airdrop 2"
echo "  anchor deploy --provider.cluster devnet"
