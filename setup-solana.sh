#!/bin/bash

# Solana Dev Environment Setup for Mac (Agave Transition)
# Run this script to install Agave CLI (new Solana), Anchor, and Rust
# See: https://github.com/anza-xyz/agave/wiki/Agave-Transition

set -e

echo "🔧 Setting up Solana (Agave) development environment..."
echo ""
echo "Note: Solana has transitioned to Agave. New installs use agave-install."
echo "See: https://github.com/anza-xyz/agave/wiki/Agave-Transition"
echo ""

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust already installed: $(rustc --version)"
fi

# Install Agave CLI (new Solana)
echo ""
echo "📦 Installing Agave CLI (Solana successor)..."
echo "Using: https://release.anza.xyz/v2.1.0/install"
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"

# Add to PATH for this session
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Create symlink for backwards compatibility (solana command)
if command -v agave-validator &> /dev/null && ! command -v solana &> /dev/null; then
    echo ""
    echo "🔗 Creating solana symlink for backwards compatibility..."
    ln -sf "$HOME/.local/share/solana/install/active_release/bin/agave-validator" \
            "$HOME/.local/share/solana/install/active_release/bin/solana" 2>/dev/null || true
fi

# Verify installation
echo ""
echo "✅ Agave/Solana CLI installed:"
solana --version || agave-validator --version

# Install Anchor
echo ""
echo "📦 Installing Anchor..."
echo "Note: Anchor 0.32+ works with Agave"
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli

# Verify installation
echo ""
echo "✅ Anchor installed:"
anchor --version

echo ""
echo "🎉 Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Add to your shell profile (~/.zshrc or ~/.bashrc):"
echo '   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"'
echo ""
echo "2. Then run:"
echo "   source ~/.zshrc  # or ~/.bashrc"
echo "   cd agent-task-marketplace"
echo "   anchor build"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Devnet deployment:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   solana config set --url devnet"
echo "   solana-keygen new --outfile ~/.config/solana/devnet.json"
echo "   solana airdrop 2"
echo "   anchor deploy --provider.cluster devnet"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Migration Notes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• solana-validator → agave-validator (or solana still works)"
echo "• solana-install → agave-install (use anza.xyz URLs now)"
echo "• See: https://github.com/anza-xyz/agave/wiki/Agave-Transition"
echo ""
