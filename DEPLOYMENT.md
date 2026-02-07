# Deployment Guide

This guide is for judges or users who want to build and deploy the Agent Task Marketplace program.

## Prerequisites

- Rust 1.70+ 
- Solana CLI 1.18.0+
- Anchor 0.30.1
- Node.js 18+

## Install Prerequisites

### 1. Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup default stable
```

### 2. Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

### 3. Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
anchor --version
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

### 2. Create/Import Wallet
```bash
# Create new wallet
solana-keygen new --outfile ~/.config/solana/devnet.json

# Or use existing
solana config set --keypair ~/.config/solana/devnet.json
```

### 3. Airdrop SOL
```bash
solana airdrop 2
solana balance
```

### 4. Deploy
```bash
anchor deploy --provider.cluster devnet
```

### 5. Update IDL
```bash
anchor idl init --filepath target/idl/agent_task_marketplace.json <PROGRAM_ID>
```

## Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>" > .env.local

# Run dev server
npm run dev
```

## Program ID

The program ID in the code is a placeholder: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

After deployment, update:
1. `Anchor.toml` - `[programs.devnet]` section
2. `programs/agent-task-marketplace/src/lib.rs` - `declare_id!`
3. `sdk/idl.json` - `metadata.address`
4. `frontend/.env.local` - `NEXT_PUBLIC_PROGRAM_ID`

## Verification

After deployment, verify the program:
```bash
solana program show <PROGRAM_ID>
```

## Integration Test

Use the SDK to test deployed program:
```typescript
import { MarketplaceSDK } from './sdk';

const sdk = new MarketplaceSDK(connection, wallet);

// Test posting a task
const { taskId } = await sdk.postTask({...});
console.log('Task created:', taskId.toBase58());
```

## Troubleshooting

### Build Errors
- Ensure Rust version: `rustc --version` should be 1.70+
- Clear build cache: `cargo clean && anchor build`

### Deployment Errors
- Check wallet has SOL: `solana balance`
- Verify network: `solana config get`
- Try more airdrop: `solana airdrop 5`

### Test Errors
- Ensure validator is running: `solana-test-validator`
- Check program is built: `anchor build`
