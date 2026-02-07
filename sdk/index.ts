import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, utils, BN } from '@coral-xyz/anchor';
import { AgentTaskMarketplace } from './types/agent_task_marketplace';
import idl from './idl.json';

export type TaskStatus = 'Open' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
export type BidStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';

export interface Milestone {
  description: string;
  amount: BN;
  completed: boolean;
  paid: boolean;
}

export interface Task {
  owner: PublicKey;
  title: string;
  description: string;
  budget: BN;
  milestones: Milestone[];
  deadline: BN;
  status: TaskStatus;
  acceptedBid: PublicKey | null;
  escrowAccount: PublicKey | null;
  createdAt: BN;
  updatedAt: BN;
}

export interface Bid {
  task: PublicKey;
  bidder: PublicKey;
  amount: BN;
  timeline: BN;
  proposal: string;
  status: BidStatus;
  createdAt: BN;
}

export interface AgentProfile {
  owner: PublicKey;
  name: string;
  tasksPosted: number;
  tasksCompleted: number;
  totalEarned: BN;
  totalSpent: BN;
  ratingSum: number;
  ratingCount: number;
  createdAt: BN;
}

export class MarketplaceSDK {
  private program: Program<AgentTaskMarketplace>;
  private connection: Connection;
  private wallet: Wallet;

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.wallet = wallet;
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    this.program = new Program(idl as AgentTaskMarketplace, provider);
  }

  // ===== Task Operations =====

  async postTask(params: {
    title: string;
    description: string;
    budget: BN;
    milestones: { description: string; amount: BN }[];
    deadline: BN;
  }): Promise<{ taskId: PublicKey; tx: string }> {
    const owner = this.wallet.publicKey;
    
    // Derive task PDA
    const [taskPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('task'), owner.toBuffer(), Buffer.from(params.title)],
      this.program.programId
    );

    const milestones = params.milestones.map(m => ({
      description: m.description,
      amount: m.amount,
      completed: false,
      paid: false,
    }));

    const tx = await this.program.methods
      .postTask(params.title, params.description, params.budget, milestones, params.deadline)
      .accounts({
        owner,
        task: taskPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { taskId: taskPda, tx };
  }

  async getTask(taskId: PublicKey): Promise<Task> {
    return this.program.account.task.fetch(taskId) as Promise<Task>;
  }

  async listTasks(): Promise<{ pubkey: PublicKey; account: Task }[]> {
    return this.program.account.task.all() as Promise<{ pubkey: PublicKey; account: Task }[]>;
  }

  async updateTask(
    taskId: PublicKey,
    params: {
      description?: string;
      budget?: BN;
      deadline?: BN;
    }
  ): Promise<string> {
    return this.program.methods
      .updateTask(
        params.description ?? null,
        params.budget ?? null,
        params.deadline ?? null
      )
      .accounts({
        owner: this.wallet.publicKey,
        task: taskId,
      })
      .rpc();
  }

  async cancelTask(taskId: PublicKey): Promise<string> {
    return this.program.methods
      .cancelTask()
      .accounts({
        owner: this.wallet.publicKey,
        task: taskId,
      })
      .rpc();
  }

  // ===== Bid Operations =====

  async submitBid(params: {
    taskId: PublicKey;
    amount: BN;
    timeline: BN;
    proposal: string;
  }): Promise<{ bidId: PublicKey; tx: string }> {
    const bidder = this.wallet.publicKey;

    // Derive bid PDA
    const [bidPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('bid'), params.taskId.toBuffer(), bidder.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .submitBid(params.amount, params.timeline, params.proposal)
      .accounts({
        bidder,
        task: params.taskId,
        bid: bidPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { bidId: bidPda, tx };
  }

  async getBid(bidId: PublicKey): Promise<Bid> {
    return this.program.account.bid.fetch(bidId) as Promise<Bid>;
  }

  async listBidsForTask(taskId: PublicKey): Promise<{ pubkey: PublicKey; account: Bid }[]> {
    const allBids = await this.program.account.bid.all();
    return allBids.filter(bid => bid.account.task.toBase58() === taskId.toBase58()) as { pubkey: PublicKey; account: Bid }[];
  }

  async acceptBid(taskId: PublicKey, bidId: PublicKey): Promise<string> {
    return this.program.methods
      .acceptBid()
      .accounts({
        owner: this.wallet.publicKey,
        task: taskId,
        bid: bidId,
      })
      .rpc();
  }

  async rejectBid(taskId: PublicKey, bidId: PublicKey): Promise<string> {
    return this.program.methods
      .rejectBid()
      .accounts({
        owner: this.wallet.publicKey,
        task: taskId,
        bid: bidId,
      })
      .rpc();
  }

  async withdrawBid(bidId: PublicKey): Promise<string> {
    return this.program.methods
      .withdrawBid()
      .accounts({
        bidder: this.wallet.publicKey,
        bid: bidId,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  // ===== Profile Operations =====

  async initializeProfile(name: string): Promise<{ profileId: PublicKey; tx: string }> {
    const owner = this.wallet.publicKey;

    // Derive profile PDA
    const [profilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('profile'), owner.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .initializeAgentProfile(name)
      .accounts({
        owner,
        profile: profilePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { profileId: profilePda, tx };
  }

  async getProfile(profileId: PublicKey): Promise<AgentProfile> {
    return this.program.account.agentProfile.fetch(profileId) as Promise<AgentProfile>;
  }

  async getProfileByOwner(owner: PublicKey): Promise<AgentProfile | null> {
    const [profilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('profile'), owner.toBuffer()],
      this.program.programId
    );
    try {
      return await this.getProfile(profilePda);
    } catch {
      return null;
    }
  }

  // ===== Utility Methods =====

  getAverageRating(profile: AgentProfile): number {
    if (profile.ratingCount === 0) return 0;
    return profile.ratingSum / profile.ratingCount;
  }

  formatAmount(amount: BN, decimals: number = 6): string {
    const divisor = new BN(10).pow(new BN(decimals));
    const whole = amount.div(divisor).toString();
    const fraction = amount.mod(divisor).toString().padStart(decimals, '0');
    return `${whole}.${fraction}`;
  }
}

export default MarketplaceSDK;
