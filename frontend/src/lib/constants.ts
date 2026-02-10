import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "8FBDDMZbqinW6UdrBdCS6QeNgW1TLQCkq43MdQX8zqmM"
);

export const IDL_ACCOUNT = new PublicKey(
  "xsijTog5PFJQRZyQRi1yFcAPZsq5Jmpquj9GE5acecq"
);

export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

// Use Helius RPC if API key is provided, otherwise fallback to public endpoints
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const HELIUS_NETWORK = NETWORK === "mainnet" ? "mainnet" : "devnet";

export const RPC_ENDPOINT =
  HELIUS_API_KEY
    ? `https://${HELIUS_NETWORK}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
      (NETWORK === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com");

export const TASK_SEED = "task";
export const BID_SEED = "bid";
export const ESCROW_SEED = "escrow";
export const PROFILE_SEED = "profile";
export const REVIEW_SEED = "review";

export const TASK_STATUS = {
  OPEN: { open: {} },
  IN_PROGRESS: { inProgress: {} },
  COMPLETED: { completed: {} },
  CANCELLED: { cancelled: {} },
  DISPUTED: { disputed: {} },
} as const;

export const BID_STATUS = {
  PENDING: { pending: {} },
  ACCEPTED: { accepted: {} },
  REJECTED: { rejected: {} },
  WITHDRAWN: { withdrawn: {} },
} as const;

export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_MILESTONES = 10;
export const MAX_PROPOSAL_LENGTH = 2000;
export const MAX_NAME_LENGTH = 50;
export const MAX_REVIEW_LENGTH = 1000;

export const TOKEN_DECIMALS = 9;
export const LAMPORTS_PER_SOL = 1_000_000_000;
