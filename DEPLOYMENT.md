# DEPLOYMENT.md

This guide covers building and deploying the Agent Task Marketplace on Solana.

## ⚠️ Important: Agave Transition (2024-2025)

**Solana has transitioned to Agave.** The `solana-install` tool is now `agave-install`.

- **New installs**: Use `agave-install` from https://release.anza.xyz
- **Old installs**: Still work but deprecated after v1.18
- **Timeline**: v2.0+ only available via Agave

**Key changes:**
| Old | New |
|-----|-----|
| `solana-install` | `agave-install` |
| `solana-validator` | `agave-validator` (or keep using `solana`) |
| Source repo | `anza-xyz/agave` (was `solana-labs/solana`) |
| Release URL | `release.anza.xyz` (was `release.solana.com`) |

Read more: https://github.com/anza-xyz/agave/wiki/Agave-Transition

## Prerequisites

- **Rust** 1.70+ 
- **Agave/Solana CLI** 2.0+
- **Anchor** 0.32.1+
- **Node.js** 18+

## Quick Install (Mac/Linux)

```bash
# 1. Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 2. Install Agave CLI (new Solana)
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# 3. Verify
solana --version  # Should show 2.x.x

# 4. Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli

# 5. Verify
anchor --version  # Should show 0.32.1
```

Or use the setup script:
```bash
curl -sSL https://raw.githubusercontent.com/mide-agent/agent-task-marketplace/main/setup-solana.sh | bash
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
# Run tests (requires local validator)
anchor test
```

## Deploy to Devnet

### 1. Configure Agave/Solana CLI
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

### "Command not installed: `solana-install`"
You're using Anchor 0.32+ but have the old Solana CLI. Install Agave:
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
```

### "No such file or directory (os error 2)"
Solana/Agave CLI not in PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### "Failed to install Agave"
Check your internet connection and try:
```bash
curl -I https://release.anza.xyz/v2.1.0/install
```

### Build Errors
- Ensure Rust version: `rustc --version` should be 1.70+
- Clear build cache: `cargo clean && anchor build`
- Update Anchor: `cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --force`

### Deployment Errors
- Check wallet has SOL: `solana balance`
- Verify network: `solana config get`
- Try more airdrop: `solana airdrop 5`

### Version Mismatches
This project uses Anchor 0.32.1. If you have a different version:
```bash
# Check versions
anchor --version
solana --version

# Reinstall matching versions
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --force
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
```

## Verification

After deployment, verify the program:
```bash
solana program show <PROGRAM_ID>
```

## Integration Test

Use the SDK to test the deployed program:
```typescript
import { MarketplaceSDK } from './sdk';

const sdk = new MarketplaceSDK(connection, wallet);

// Test posting a task
const { taskId } = await sdk.postTask({...});
console.log('Task created:', taskId.toBase58());
```

## Resources

- **Agave Transition Guide**: https://github.com/anza-xyz/agave/wiki/Agave-Transition
- **Anchor Docs**: https://book.anchor-lang.com
- **Solana Docs**: https://docs.solana.com
- **Project Repo**: https://github.com/mide-agent/agent-task-marketplace
