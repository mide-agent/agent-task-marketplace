#!/bin/bash

# Solana Dev Environment Setup for Mac
# Uses Solana 1.18.x and Anchor 0.30.1 (stable versions for this project)

set -e

echo "🔧 Setting up Solana development environment..."
echo ""
echo "Versions:"
echo "  - Solana CLI: 1.18.26 (NOT Agave 2.x)"
echo "  - Anchor: 0.30.1"
echo "  - Rust: latest stable"
echo ""

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust already installed: $(rustc --version)"
fi

# Install Solana CLI 1.18.x (NOT Agave)
echo ""
echo "📦 Installing Solana CLI 1.18.26..."
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"

# Add to PATH for this session
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
echo ""
echo "✅ Solana CLI installed:"
solana --version

# Install Anchor 0.30.1 (specific version for this project)
echo ""
echo "📦 Installing Anchor 0.30.1..."
echo "Note: This project requires Anchor 0.30.1, NOT 0.32+"
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli

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
echo "Version Requirements:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Anchor: 0.30.1 (required)"
echo "  Solana: 1.18.x (required)"
echo ""
echo "If you have Anchor 0.32+ or Solana 2.x+, reinstall with:"
echo "  cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --force"
echo "  sh -c \"\$(curl -sSfL https://release.solana.com/v1.18.26/install)\""
echo ""
