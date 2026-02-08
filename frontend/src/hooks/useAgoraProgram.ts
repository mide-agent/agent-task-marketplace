import { useEffect, useMemo, useState } from "react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { IDL, Agora } from "@/idl/agora";
import {
  PROGRAM_ID,
  PROFILE_SEED,
  ESCROW_SEED,
  TOKEN_DECIMALS,
} from "@/lib/constants";

export type TaskStatus = "open" | "inProgress" | "completed" | "cancelled" | "disputed";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Milestone {
  description: string;
  amount: BN;
  completed: boolean;
  paid: boolean;
}

export interface Task {
  publicKey: PublicKey;
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
  publicKey: PublicKey;
  task: PublicKey;
  bidder: PublicKey;
  amount: BN;
  timeline: BN;
  proposal: string;
  status: BidStatus;
  createdAt: BN;
}

export interface AgentProfile {
  publicKey: PublicKey;
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

export interface Escrow {
  publicKey: PublicKey;
  task: PublicKey;
  client: PublicKey;
  freelancer: PublicKey;
  totalAmount: BN;
  releasedAmount: BN;
  tokenMint: PublicKey;
  bump: number;
}

export function useAgoraProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<Agora>(IDL, PROGRAM_ID, provider);
  }, [provider]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    console.error("Program error:", err);
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unknown error occurred");
    }
    setIsLoading(false);
    throw err;
  };

  // Agent Profile Functions
  const getProfilePDA = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PROFILE_SEED), owner.toBuffer()],
      PROGRAM_ID
    )[0];
  };

  const initializeProfile = async (name: string) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const profilePDA = getProfilePDA(publicKey);
      
      const tx = await program.methods
        .initializeAgentProfile(name)
        .accounts({
          owner: publicKey,
          profile: profilePDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  const getProfile = async (owner?: PublicKey): Promise<AgentProfile | null> => {
    if (!program) return null;
    
    const target = owner || publicKey;
    if (!target) return null;

    try {
      const profilePDA = getProfilePDA(target);
      const account = await program.account.agentProfile.fetch(profilePDA);
      return {
        ...account,
        publicKey: profilePDA,
      };
    } catch {
      return null;
    }
  };

  // Task Functions
  const postTask = async (
    title: string,
    description: string,
    budget: number,
    milestones: { description: string; amount: number }[],
    deadlineDays: number
  ) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const taskKeypair = web3.Keypair.generate();
      const deadline = Math.floor(Date.now() / 1000) + deadlineDays * 24 * 60 * 60;

      const milestoneData = milestones.map((m) => ({
        description: m.description,
        amount: new BN(m.amount * 10 ** TOKEN_DECIMALS),
        completed: false,
        paid: false,
      }));

      const tx = await program.methods
        .postTask(
          title,
          description,
          new BN(budget * 10 ** TOKEN_DECIMALS),
          milestoneData,
          new BN(deadline)
        )
        .accounts({
          owner: publicKey,
          task: taskKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([taskKeypair])
        .rpc();

      setIsLoading(false);
      return { tx, taskPDA: taskKeypair.publicKey };
    } catch (err) {
      handleError(err);
    }
  };

  const getAllTasks = async (): Promise<Task[]> => {
    if (!program) return [];

    try {
      const tasks = await program.account.task.all();
      return tasks.map((t) => ({
        ...t.account,
        publicKey: t.publicKey,
        status: Object.keys(t.account.status)[0] as TaskStatus,
      }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
      return [];
    }
  };

  const getTask = async (taskPDA: PublicKey): Promise<Task | null> => {
    if (!program) return null;

    try {
      const account = await program.account.task.fetch(taskPDA);
      return {
        ...account,
        publicKey: taskPDA,
        status: Object.keys(account.status)[0] as TaskStatus,
      };
    } catch {
      return null;
    }
  };

  const cancelTask = async (taskPDA: PublicKey) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .cancelTask()
        .accounts({
          owner: publicKey,
          task: taskPDA,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  // Bid Functions
  const submitBid = async (
    taskPDA: PublicKey,
    amount: number,
    timelineDays: number,
    proposal: string
  ) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const bidKeypair = web3.Keypair.generate();
      const timeline = timelineDays * 24 * 60 * 60;

      const tx = await program.methods
        .submitBid(
          new BN(amount * 10 ** TOKEN_DECIMALS),
          new BN(timeline),
          proposal
        )
        .accounts({
          bidder: publicKey,
          task: taskPDA,
          bid: bidKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([bidKeypair])
        .rpc();

      setIsLoading(false);
      return { tx, bidPDA: bidKeypair.publicKey };
    } catch (err) {
      handleError(err);
    }
  };

  const getBidsForTask = async (taskPDA: PublicKey): Promise<Bid[]> => {
    if (!program) return [];

    try {
      const bids = await program.account.bid.all([
        {
          memcmp: {
            offset: 8,
            bytes: taskPDA.toBase58(),
          },
        },
      ]);

      return bids.map((b) => ({
        ...b.account,
        publicKey: b.publicKey,
        status: Object.keys(b.account.status)[0] as BidStatus,
      }));
    } catch (err) {
      console.error("Error fetching bids:", err);
      return [];
    }
  };

  const getBid = async (bidPDA: PublicKey): Promise<Bid | null> => {
    if (!program) return null;

    try {
      const account = await program.account.bid.fetch(bidPDA);
      return {
        ...account,
        publicKey: bidPDA,
        status: Object.keys(account.status)[0] as BidStatus,
      };
    } catch {
      return null;
    }
  };

  const acceptBid = async (taskPDA: PublicKey, bidPDA: PublicKey) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .acceptBid()
        .accounts({
          owner: publicKey,
          task: taskPDA,
          bid: bidPDA,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  const rejectBid = async (taskPDA: PublicKey, bidPDA: PublicKey) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .rejectBid()
        .accounts({
          owner: publicKey,
          task: taskPDA,
          bid: bidPDA,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  const withdrawBid = async (bidPDA: PublicKey) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .withdrawBid()
        .accounts({
          bidder: publicKey,
          bid: bidPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  // Escrow Functions
  const getEscrowPDA = (taskPDA: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(ESCROW_SEED), taskPDA.toBuffer()],
      PROGRAM_ID
    )[0];
  };

  const fundEscrow = async (
    taskPDA: PublicKey,
    bidPDA: PublicKey,
    tokenMint: PublicKey
  ) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const escrowPDA = getEscrowPDA(taskPDA);
      const clientTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );
      const escrowTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        escrowPDA,
        true
      );

      const tx = await program.methods
        .fundEscrow()
        .accounts({
          client: publicKey,
          task: taskPDA,
          acceptedBid: bidPDA,
          escrow: escrowPDA,
          clientTokenAccount,
          escrowTokenAccount,
          tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  const completeMilestone = async (taskPDA: PublicKey, bidPDA: PublicKey, milestoneIndex: number) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .completeMilestone(milestoneIndex)
        .accounts({
          freelancer: publicKey,
          task: taskPDA,
          bid: bidPDA,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  const releasePayment = async (
    taskPDA: PublicKey,
    escrowPDA: PublicKey,
    freelancer: PublicKey,
    tokenMint: PublicKey,
    milestoneIndex: number
  ) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");
    setIsLoading(true);
    setError(null);

    try {
      const escrowTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        escrowPDA,
        true
      );
      const freelancerTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        freelancer
      );

      const tx = await program.methods
        .releasePayment(milestoneIndex)
        .accounts({
          client: publicKey,
          task: taskPDA,
          escrow: escrowPDA,
          escrowTokenAccount,
          freelancerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setIsLoading(false);
      return tx;
    } catch (err) {
      handleError(err);
    }
  };

  return {
    program,
    provider,
    isLoading,
    error,
    setError,
    // Profile
    getProfilePDA,
    initializeProfile,
    getProfile,
    // Tasks
    postTask,
    getAllTasks,
    getTask,
    cancelTask,
    // Bids
    submitBid,
    getBidsForTask,
    getBid,
    acceptBid,
    rejectBid,
    withdrawBid,
    // Escrow
    getEscrowPDA,
    fundEscrow,
    completeMilestone,
    releasePayment,
  };
}
