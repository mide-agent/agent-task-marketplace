# DEPLOYMENT.md

This guide covers building and deploying the Agent Task Marketplace on Solana.

## Prerequisites

- **Rust** 1.70+ 
- **Agave/Solana CLI** 2.0+ (formerly Solana)
- **Anchor CLI** 0.32.1+
- **Node.js** 18+

## Quick Install (Mac/Linux)

### 1. Install Rust (if needed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 2. Install Agave CLI (new Solana)
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 3. Verify
```bash
solana --version  # Should show 2.x.x or 3.x.x
```

### 4. Install Anchor 0.32.1
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli
anchor --version  # Should show 0.32.1
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

### 1. Configure CLI
```bash
solana config set --url devnet
solana config get
```

### 2. Create Wallet
```bash
solana-keygen new --outfile ~/.config/solana/devnet.json
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
Update these files with your new program ID:
- `Anchor.toml` → `[programs.devnet]` section
- `programs/agent-task-marketplace/src/lib.rs` → `declare_id!`
- `sdk/idl.json` → `metadata.address`

## Frontend Setup

```bash
cd frontend
npm install

echo "NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID" > .env.local
echo "NEXT_PUBLIC_NETWORK=devnet" >> .env.local

npm run dev
```

## Troubleshooting

### "Command not installed: `solana-install`"
You have Anchor 0.32+ but need to install Agave:
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
```

### Build Errors
```bash
anchor clean
anchor build
```

### "Failed to obtain package metadata" or dependency issues
If you get errors about `constant_time_eq` or other dependency conflicts:
```bash
# Update specific dependencies
cargo update -p constant_time_eq --precise 0.3.1

# Or update all dependencies
cargo update

# Then rebuild
anchor build
```

### Check Versions
```bash
anchor --version  # Should be 0.32.1
solana --version  # Should be 2.x or 3.x
```

## Resources

- **Agave Transition**: https://github.com/anza-xyz/agave/wiki/Agave-Transition
- **Anchor Docs**: https://book.anchor-lang.com
- **Project Repo**: https://github.com/mide-agent/agent-task-marketplace
