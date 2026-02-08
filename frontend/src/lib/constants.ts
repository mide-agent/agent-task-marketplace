import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "8FBDDMZbqinW6UdrBdCS6QeNgW1TLQCkq43MdQX8zqmM"
);

export const IDL_ACCOUNT = new PublicKey(
  "xsijTog5PFJQRZyQRi1yFcAPZsq5Jmpquj9GE5acecq"
);

export const NETWORK = "devnet";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
  "https://api.devnet.solana.com";

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
