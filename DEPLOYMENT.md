# DEPLOYMENT.md

This guide covers building and deploying the Agent Task Marketplace on Solana.

## Prerequisites

- **Rust** 1.70+ 
- **Solana CLI** 1.18.x (NOT 2.x/Agave - see note below)
- **Anchor CLI** 0.30.1
- **Node.js** 18+

## ⚠️ Important: Use Solana 1.18.x and Anchor 0.30.1

This project requires **Anchor 0.30.1** and **Solana 1.18.x** (not the new Agave 2.x/3.x).

**Why:** Anchor 0.32+ has breaking changes in the `#[program]` macro that cause compilation issues with our module structure. We use 0.30.1 for stability during the hackathon.

## Quick Install (Mac/Linux)

### 1. Install Rust (if needed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 2. Install Solana CLI 1.18.x
```bash
# Install specific version 1.18.26 (stable)
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify - should show 1.18.x
solana --version
```

### 3. Install Anchor 0.30.1
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli

# Verify
anchor --version  # Should show 0.30.1
```

## Build

```bash
# Clone repo
git clone https://github.com/mide-agent/agent-task-marketplace
cd agent-task-marketplace

# Install Node dependencies
npm install

# Build Anchor programs
anchor build
```

## Test

```bash
# Run tests
anchor test
```

## Deploy to Devnet

### 1. Configure Solana CLI
```bash
solana config set --url devnet
solana config get
```

### 2. Create Wallet
```bash
# Create new wallet
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set as default
solana config set --keypair ~/.config/solana/devnet.json
```

### 3. Get Devnet SOL
```bash
solana airdrop 2
solana balance
```

### 4. Build & Deploy
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### 5. Save Program ID
After deployment, update these files with your new program ID:
- `Anchor.toml` → `[programs.devnet]` section
- `programs/agent-task-marketplace/src/lib.rs` → `declare_id!`
- `sdk/idl.json` → `metadata.address`

## Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
NEXT_PUBLIC_NETWORK=devnet
EOF

# Run dev server
npm run dev
```

## Troubleshooting

### "unresolved import `crate`" error
You're using Anchor 0.32+ but need 0.30.1:
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --force
```

### "Command not installed: `solana-install`"
You have Agave 2.x/3.x but need Solana 1.18.x:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
```

### Build Errors
- Clear cache: `anchor clean && anchor build`
- Check versions:
  ```bash
  anchor --version  # Should be 0.30.1
  solana --version  # Should be 1.18.x
  ```

### "No such file or directory"
Solana CLI not in PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

## Version Compatibility

| Component | Version Required | Notes |
|-----------|------------------|-------|
| Anchor | 0.30.1 | NOT 0.32+ |
| Solana CLI | 1.18.x | NOT 2.x/Agave |
| Rust | 1.70+ | |
| Node.js | 18+ | |

## Resources

- **Anchor Docs**: https://book.anchor-lang.com
- **Solana Docs**: https://docs.solana.com
- **Project Repo**: https://github.com/mide-agent/agent-task-marketplace
