use anchor_lang::prelude::*;

#[account]
pub struct Task {
    pub owner: Pubkey,
    pub title: String,
    pub description: String,
    pub budget: u64,
    pub milestones: Vec<Milestone>,
    pub deadline: i64,
    pub status: TaskStatus,
    pub accepted_bid: Option<Pubkey>,
    pub escrow_account: Option<Pubkey>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Task {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DESC_LEN: usize = 5000;
    pub const MAX_MILESTONES: usize = 10;
    
    pub fn space(milestone_count: usize) -> usize {
        8 + // discriminator
        32 + // owner
        4 + Self::MAX_TITLE_LEN + // title
        4 + Self::MAX_DESC_LEN + // description
        8 + // budget
        4 + (milestone_count * Milestone::SIZE) + // milestones
        8 + // deadline
        1 + // status
        1 + 32 + // accepted_bid option
        1 + 32 + // escrow_account option
        8 + // created_at
        8 // updated_at
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Milestone {
    pub description: String,
    pub amount: u64,
    pub completed: bool,
    pub paid: bool,
}

impl Milestone {
    pub const SIZE: usize = 4 + 200 + 8 + 1 + 1; // description + amount + completed + paid
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
    Cancelled,
    Disputed,
}

#[account]
pub struct Bid {
    pub task: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub timeline: i64,
    pub proposal: String,
    pub status: BidStatus,
    pub created_at: i64,
}

impl Bid {
    pub const MAX_PROPOSAL_LEN: usize = 2000;
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // task
        32 + // bidder
        8 + // amount
        8 + // timeline
        4 + Self::MAX_PROPOSAL_LEN + // proposal
        1 + // status
        8 // created_at
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum BidStatus {
    Pending,
    Accepted,
    Rejected,
    Withdrawn,
}

#[account]
pub struct Escrow {
    pub task: Pubkey,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub token_mint: Pubkey,
    pub bump: u8,
}

impl Escrow {
    pub const SIZE: usize = 
        8 + // discriminator
        32 + // task
        32 + // client
        32 + // freelancer
        8 + // total_amount
        8 + // released_amount
        32 + // token_mint
        1; // bump
}

#[account]
pub struct AgentProfile {
    pub owner: Pubkey,
    pub name: String,
    pub tasks_posted: u32,
    pub tasks_completed: u32,
    pub total_earned: u64,
    pub total_spent: u64,
    pub rating_sum: u32,
    pub rating_count: u32,
    pub created_at: i64,
}

impl AgentProfile {
    pub const MAX_NAME_LEN: usize = 50;
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // owner
        4 + Self::MAX_NAME_LEN + // name
        4 + // tasks_posted
        4 + // tasks_completed
        8 + // total_earned
        8 + // total_spent
        4 + // rating_sum
        4 + // rating_count
        8 // created_at
    }
}

#[account]
pub struct Review {
    pub reviewer: Pubkey,
    pub reviewee: Pubkey,
    pub task: Pubkey,
    pub rating: u8,
    pub review_text: String,
    pub created_at: i64,
}

impl Review {
    pub const MAX_REVIEW_LEN: usize = 1000;
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // reviewer
        32 + // reviewee
        32 + // task
        1 + // rating
        4 + Self::MAX_REVIEW_LEN + // review_text
        8 // created_at
    }
}
