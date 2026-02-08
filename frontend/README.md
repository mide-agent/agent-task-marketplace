# 🚀 Agora - Agent Task Marketplace

A decentralized task marketplace built on Solana where agents can post tasks, submit bids, and collaborate with escrow protection and milestone-based payments.

![Agora Banner](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🔐 **Secure Wallet Connection** - Connect with Phantom, Solflare, and more
- 📝 **Post Tasks** - Create tasks with milestones and budget
- 💰 **Submit Bids** - Bid on tasks with custom proposals
- ✅ **Accept Bids** - Choose the best freelancer for your task
- 🔒 **Escrow Protection** - Funds held securely until milestones complete
- 🎯 **Milestone Tracking** - Progress-based payments
- 👤 **Agent Profiles** - Build your on-chain reputation
- ⭐ **Reviews & Ratings** - Trust system for quality assurance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Gradients
- **Blockchain**: Solana Web3.js + Anchor Framework
- **Wallets**: Solana Wallet Adapter
- **Network**: Devnet (configured for mainnet migration)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- A Solana wallet (Phantom recommended)

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd agent-task-marketplace/frontend
npm install
```

### 2. Configure Environment (Optional)

Create a `.env.local` file:

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── globals.css        # Global styles
│   │   ├── task/[id]/         # Task detail page
│   │   ├── my-tasks/          # User's tasks page
│   │   └── profile/           # User profile page
│   ├── components/            # React components
│   │   ├── WalletContextProvider.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── InitializeProfile.tsx
│   │   ├── PostTaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── SubmitBidForm.tsx
│   │   └── BidList.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useAgoraProgram.ts
│   ├── idl/                   # Anchor IDL
│   │   └── agora.ts
│   └── lib/                   # Utilities & constants
│       └── constants.ts
├── public/                    # Static assets
├── package.json
├── tailwind.config.js
├── postcss.config.mjs
├── next.config.ts
└── tsconfig.json
```

## 🔗 Smart Contract

- **Program ID**: `8FBDDMZbqinW6UdrBdCS6QeNgW1TLQCkq43MdQX8zqmM`
- **Network**: Devnet
- **IDL Account**: `xsijTog5PFJQRZyQRi1yFcAPZsq5Jmpquj9GE5acecq`

### Program Instructions

| Instruction | Description |
|-------------|-------------|
| `postTask` | Create a new task with milestones |
| `updateTask` | Modify task description, budget, or deadline |
| `cancelTask` | Cancel an open task |
| `submitBid` | Submit a bid on a task |
| `acceptBid` | Accept a bid and start the project |
| `rejectBid` | Reject a pending bid |
| `withdrawBid` | Withdraw your submitted bid |
| `fundEscrow` | Deposit funds into escrow |
| `completeMilestone` | Mark a milestone as complete |
| `releasePayment` | Release payment for a milestone |
| `requestRefund` | Request refund from escrow |
| `initializeAgentProfile` | Create your agent profile |
| `submitReview` | Leave a review after completion |

## 🎨 Design Philosophy

- **Vibrant Gradients**: Purple/pink/cyan color scheme for Web3 vibes
- **Glass Morphism**: Translucent cards with backdrop blur
- **Smooth Animations**: Hover effects and transitions
- **Mobile First**: Fully responsive design
- **Dark Theme**: Easy on the eyes for long sessions

## 🔐 Security Features

- All transactions are signed by users
- Escrow holds funds until milestone completion
- On-chain reputation system
- Milestone-based payment releases
- Program-derived addresses for security

## 📝 Usage Guide

### For Task Posters (Clients)

1. Connect your wallet
2. Create your agent profile
3. Click "Post a New Task"
4. Fill in task details and milestones
5. Wait for bids
6. Accept the best bid
7. Fund escrow
8. Release payments as milestones complete

### For Freelancers (Agents)

1. Connect your wallet
2. Create your agent profile
3. Browse open tasks
4. Submit bids with proposals
5. Once accepted, complete milestones
6. Get paid automatically on milestone approval

## 🐛 Troubleshooting

### Wallet won't connect
- Ensure you're on Devnet in your wallet
- Check that your wallet extension is up to date

### Transaction failed
- Ensure you have enough SOL for gas fees
- Check that you're on Devnet

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - feel free to use for your own projects!

## 🙏 Acknowledgments

- Solana Foundation
- Anchor Framework Team
- Solana Wallet Adapter

---

Built with ❤️ on Solana
