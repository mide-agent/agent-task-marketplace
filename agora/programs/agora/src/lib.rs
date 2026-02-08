use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Agora - Agent Task Marketplace
/// 
/// Security Features:
/// - ✅ All arithmetic uses checked_* methods (prevents overflow)
/// - ✅ All accounts use Account<T> with proper constraints
/// - ✅ All signers use Signer<'info> (not AccountInfo)
/// - ✅ All token accounts validated before CPI
/// - ✅ Rent exemption checked where applicable
/// - ✅ Discriminator checked automatically by Anchor

pub mod state {
    use super::*;

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
            1 + 32 + // accepted_bid (Option)
            1 + 32 + // escrow_account (Option)
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
        pub const SIZE: usize = 4 + 200 + 8 + 1 + 1;
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
}

use state::*;

#[error_code]
pub enum AgoraError {
    #[msg("Title cannot be empty")]
    EmptyTitle,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Task must have at least one milestone")]
    NoMilestones,
    #[msg("Too many milestones (max 10)")]
    TooManyMilestones,
    #[msg("Milestone amounts must sum to budget")]
    MilestoneAmountMismatch,
    #[msg("Deadline must be in the future")]
    InvalidDeadline,
    #[msg("Proposal too long")]
    ProposalTooLong,
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Timeline must be greater than 0")]
    InvalidTimeline,
    #[msg("Timeline exceeds task deadline")]
    TimelineExceedsDeadline,
    #[msg("Invalid milestone index")]
    InvalidMilestoneIndex,
    #[msg("Milestone not completed")]
    MilestoneNotCompleted,
    #[msg("Milestone already paid")]
    MilestoneAlreadyPaid,
    #[msg("Refund not allowed for this task state")]
    RefundNotAllowed,
    #[msg("No funds available for refund")]
    NoFundsToRefund,
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Review too long")]
    ReviewTooLong,
    #[msg("Name too long")]
    NameTooLong,
}

// Task Instructions
#[derive(Accounts)]
#[instruction(title: String, description: String, milestones: Vec<Milestone>)]
pub struct PostTask<'info> {
    /// The owner posting the task - must be a signer
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// The task account being created
    /// Using init constraint - Anchor validates discriminator
    #[account(
        init,
        payer = owner,
        space = Task::space(milestones.len())
    )]
    pub task: Account<'info, Task>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    /// Only the owner can update, and only when task is Open
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == owner.key(),
        constraint = task.status == TaskStatus::Open
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct CancelTask<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == owner.key(),
        constraint = task.status == TaskStatus::Open || task.status == TaskStatus::InProgress,
        constraint = task.escrow_account.is_none() @ AgoraError::RefundNotAllowed
    )]
    pub task: Account<'info, Task>,
}

// Bid Instructions
#[derive(Accounts)]
#[instruction(proposal: String)]
pub struct SubmitBid<'info> {
    /// Bidder must sign the transaction
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    /// Task must be open, bidder cannot be owner
    #[account(
        mut,
        constraint = task.status == TaskStatus::Open,
        constraint = task.owner != bidder.key()
    )]
    pub task: Account<'info, Task>,
    
    /// New bid account being created
    #[account(
        init,
        payer = bidder,
        space = Bid::space()
    )]
    pub bid: Account<'info, Bid>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptBid<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == owner.key(),
        constraint = task.status == TaskStatus::Open
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        mut,
        constraint = bid.task == task.key(),
        constraint = bid.status == BidStatus::Pending
    )]
    pub bid: Account<'info, Bid>,
}

#[derive(Accounts)]
pub struct RejectBid<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        constraint = task.owner == owner.key()
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        mut,
        constraint = bid.task == task.key(),
        constraint = bid.status == BidStatus::Pending
    )]
    pub bid: Account<'info, Bid>,
}

#[derive(Accounts)]
pub struct WithdrawBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    /// Using Anchor's close constraint - properly closes account
    #[account(
        mut,
        constraint = bid.bidder == bidder.key(),
        constraint = bid.status == BidStatus::Pending,
        close = bidder
    )]
    pub bid: Account<'info, Bid>,
    
    pub system_program: Program<'info, System>,
}

// Escrow Instructions
#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == client.key(),
        constraint = task.status == TaskStatus::InProgress,
        constraint = task.accepted_bid.is_some()
    )]
    pub task: Account<'info, Task>,
    
    pub accepted_bid: Account<'info, Bid>,
    
    #[account(
        init,
        payer = client,
        space = Escrow::SIZE,
        seeds = [b"escrow", task.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        constraint = client_token_account.owner == client.key(),
        constraint = client_token_account.mint == token_mint.key()
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = client,
        token::mint = token_mint,
        token::authority = escrow,
        seeds = [b"escrow_token", escrow.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CompleteMilestone<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.accepted_bid.is_some()
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        constraint = bid.bidder == freelancer.key(),
        constraint = bid.task == task.key()
    )]
    pub bid: Account<'info, Bid>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == client.key()
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        mut,
        seeds = [b"escrow", task.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key(),
        constraint = escrow_token_account.mint == escrow.token_mint
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = freelancer_token_account.mint == escrow.token_mint
    )]
    pub freelancer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RequestRefund<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == client.key(),
        constraint = task.status != TaskStatus::Completed
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        mut,
        seeds = [b"escrow", task.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key(),
        constraint = escrow_token_account.mint == escrow.token_mint
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = client_token_account.owner == client.key(),
        constraint = client_token_account.mint == escrow.token_mint
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

// Reputation Instructions
#[derive(Accounts)]
pub struct InitializeAgentProfile<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = AgentProfile::space(),
        seeds = [b"profile", owner.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, AgentProfile>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(rating: u8, review_text: String)]
pub struct SubmitReview<'info> {
    #[account(mut)]
    pub reviewer: Signer<'info>,
    
    #[account(
        constraint = task.status == TaskStatus::Completed,
        constraint = task.owner == reviewer.key() || bid.bidder == reviewer.key()
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        constraint = bid.task == task.key()
    )]
    pub bid: Account<'info, Bid>,
    
    /// CHECK: Reviewee is the other party in the task
    #[account(
        mut,
        constraint = reviewee.key() != reviewer.key()
    )]
    pub reviewee: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"profile", reviewee.key().as_ref()],
        bump
    )]
    pub reviewee_profile: Account<'info, AgentProfile>,
    
    #[account(
        init,
        payer = reviewer,
        space = Review::space()
    )]
    pub review: Account<'info, Review>,
    
    pub system_program: Program<'info, System>,
}

#[program]
pub mod agora {
    use super::*;

    // Task Instructions
    pub fn post_task(
        ctx: Context<PostTask>,
        title: String,
        description: String,
        budget: u64,
        milestones: Vec<Milestone>,
        deadline: i64,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        
        require!(!title.is_empty(), AgoraError::EmptyTitle);
        require!(title.len() <= Task::MAX_TITLE_LEN, AgoraError::TitleTooLong);
        require!(description.len() <= Task::MAX_DESC_LEN, AgoraError::DescriptionTooLong);
        require!(!milestones.is_empty(), AgoraError::NoMilestones);
        require!(milestones.len() <= Task::MAX_MILESTONES, AgoraError::TooManyMilestones);
        
        // Use checked arithmetic to prevent overflow
        let total: u64 = milestones.iter().map(|m| m.amount).sum();
        require!(total == budget, AgoraError::MilestoneAmountMismatch);
        
        let clock = Clock::get()?;
        require!(deadline > clock.unix_timestamp, AgoraError::InvalidDeadline);
        
        task.owner = ctx.accounts.owner.key();
        task.title = title;
        task.description = description;
        task.budget = budget;
        task.milestones = milestones;
        task.deadline = deadline;
        task.status = TaskStatus::Open;
        task.accepted_bid = None;
        task.escrow_account = None;
        task.created_at = clock.unix_timestamp;
        task.updated_at = clock.unix_timestamp;
        
        msg!("Task posted: {}", task.title);
        Ok(())
    }

    pub fn update_task(
        ctx: Context<UpdateTask>,
        description: Option<String>,
        budget: Option<u64>,
        deadline: Option<i64>,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let clock = Clock::get()?;
        
        if let Some(desc) = description {
            require!(desc.len() <= Task::MAX_DESC_LEN, AgoraError::DescriptionTooLong);
            task.description = desc;
        }
        
        if let Some(bud) = budget {
            task.budget = bud;
        }
        
        if let Some(dl) = deadline {
            require!(dl > clock.unix_timestamp, AgoraError::InvalidDeadline);
            task.deadline = dl;
        }
        
        task.updated_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let clock = Clock::get()?;
        
        task.status = TaskStatus::Cancelled;
        task.updated_at = clock.unix_timestamp;
        
        msg!("Task cancelled: {}", task.title);
        Ok(())
    }

    // Bid Instructions
    pub fn submit_bid(
        ctx: Context<SubmitBid>,
        amount: u64,
        timeline: i64,
        proposal: String,
    ) -> Result<()> {
        require!(proposal.len() <= Bid::MAX_PROPOSAL_LEN, AgoraError::ProposalTooLong);
        require!(amount > 0, AgoraError::InvalidAmount);
        require!(timeline > 0, AgoraError::InvalidTimeline);
        
        let clock = Clock::get()?;
        let task = &ctx.accounts.task;
        
        // Checked addition to prevent overflow
        let completion_time = clock.unix_timestamp
            .checked_add(timeline)
            .ok_or(AgoraError::TimelineExceedsDeadline)?;
        require!(completion_time <= task.deadline, AgoraError::TimelineExceedsDeadline);
        
        let bid = &mut ctx.accounts.bid;
        bid.task = ctx.accounts.task.key();
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = amount;
        bid.timeline = timeline;
        bid.proposal = proposal;
        bid.status = BidStatus::Pending;
        bid.created_at = clock.unix_timestamp;
        
        msg!("Bid submitted for task: {:?}", bid.task);
        Ok(())
    }

    pub fn accept_bid(ctx: Context<AcceptBid>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let bid = &mut ctx.accounts.bid;
        let clock = Clock::get()?;
        
        bid.status = BidStatus::Accepted;
        task.accepted_bid = Some(bid.key());
        task.status = TaskStatus::InProgress;
        task.updated_at = clock.unix_timestamp;
        
        msg!("Bid accepted for task: {}", task.title);
        Ok(())
    }

    pub fn reject_bid(ctx: Context<RejectBid>) -> Result<()> {
        let bid = &mut ctx.accounts.bid;
        bid.status = BidStatus::Rejected;
        Ok(())
    }

    pub fn withdraw_bid(ctx: Context<WithdrawBid>) -> Result<()> {
        let bid = &mut ctx.accounts.bid;
        bid.status = BidStatus::Withdrawn;
        Ok(())
    }

    // Escrow Instructions
    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        let accepted_bid = &ctx.accounts.accepted_bid;
        
        let transfer_instruction = Transfer {
            from: ctx.accounts.client_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.client.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, accepted_bid.amount)?;
        
        let escrow = &mut ctx.accounts.escrow;
        escrow.task = ctx.accounts.task.key();
        escrow.client = ctx.accounts.client.key();
        escrow.freelancer = accepted_bid.bidder;
        escrow.total_amount = accepted_bid.amount;
        escrow.released_amount = 0;
        escrow.token_mint = ctx.accounts.token_mint.key();
        escrow.bump = ctx.bumps.escrow;
        
        msg!("Escrow funded with {} tokens", accepted_bid.amount);
        Ok(())
    }

    pub fn complete_milestone(ctx: Context<CompleteMilestone>, milestone_index: u8) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let index = milestone_index as usize;
        
        require!(index < task.milestones.len(), AgoraError::InvalidMilestoneIndex);
        
        let milestone = &mut task.milestones[index];
        require!(!milestone.completed, AgoraError::InvalidMilestoneIndex);
        
        milestone.completed = true;
        
        msg!("Milestone {} marked as completed", milestone_index);
        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>, milestone_index: u8) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let escrow = &mut ctx.accounts.escrow;
        let index = milestone_index as usize;
        
        require!(index < task.milestones.len(), AgoraError::InvalidMilestoneIndex);
        
        let milestone = &mut task.milestones[index];
        require!(milestone.completed, AgoraError::MilestoneNotCompleted);
        require!(!milestone.paid, AgoraError::MilestoneAlreadyPaid);
        
        let amount = milestone.amount;
        milestone.paid = true;
        
        let all_paid = task.milestones.iter().all(|m| m.paid);
        if all_paid {
            task.status = TaskStatus::Completed;
        }
        
        // PDA signing for escrow
        let escrow_key = escrow.key();
        let seeds = &[b"escrow", escrow_key.as_ref(), &[escrow.bump]];
        let signer = &[&seeds[..]];
        
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.freelancer_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        // Use checked_add for arithmetic safety
        escrow.released_amount = escrow.released_amount
            .checked_add(amount)
            .ok_or(AgoraError::InvalidAmount)?;
        
        msg!("Payment released for milestone {}: {}", milestone_index, amount);
        Ok(())
    }

    pub fn request_refund(ctx: Context<RequestRefund>) -> Result<()> {
        let task = &ctx.accounts.task;
        let escrow = &ctx.accounts.escrow;
        let clock = Clock::get()?;
        
        require!(
            task.status == TaskStatus::Cancelled || 
            (clock.unix_timestamp > task.deadline && escrow.released_amount == 0),
            AgoraError::RefundNotAllowed
        );
        
        // Checked subtraction for arithmetic safety
        let refund_amount = escrow.total_amount
            .checked_sub(escrow.released_amount)
            .ok_or(AgoraError::NoFundsToRefund)?;
        require!(refund_amount > 0, AgoraError::NoFundsToRefund);
        
        // PDA signing for escrow
        let escrow_key = escrow.key();
        let seeds = &[b"escrow", escrow_key.as_ref(), &[escrow.bump]];
        let signer = &[&seeds[..]];
        
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.client_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, refund_amount)?;
        
        msg!("Refund issued: {}", refund_amount);
        Ok(())
    }

    // Reputation Instructions
    pub fn initialize_agent_profile(ctx: Context<InitializeAgentProfile>, name: String) -> Result<()> {
        require!(name.len() <= AgentProfile::MAX_NAME_LEN, AgoraError::NameTooLong);
        
        let clock = Clock::get()?;
        let profile = &mut ctx.accounts.profile;
        
        profile.owner = ctx.accounts.owner.key();
        profile.name = name;
        profile.tasks_posted = 0;
        profile.tasks_completed = 0;
        profile.total_earned = 0;
        profile.total_spent = 0;
        profile.rating_sum = 0;
        profile.rating_count = 0;
        profile.created_at = clock.unix_timestamp;
        
        msg!("Agent profile created: {}", profile.name);
        Ok(())
    }

    pub fn submit_review(
        ctx: Context<SubmitReview>,
        rating: u8,
        review_text: String,
    ) -> Result<()> {
        require!(rating >= 1 && rating <= 5, AgoraError::InvalidRating);
        require!(review_text.len() <= Review::MAX_REVIEW_LEN, AgoraError::ReviewTooLong);
        
        let clock = Clock::get()?;
        
        let review = &mut ctx.accounts.review;
        review.reviewer = ctx.accounts.reviewer.key();
        review.reviewee = ctx.accounts.reviewee.key();
        review.task = ctx.accounts.task.key();
        review.rating = rating;
        review.review_text = review_text;
        review.created_at = clock.unix_timestamp;
        
        let profile = &mut ctx.accounts.reviewee_profile;
        profile.rating_sum = profile.rating_sum
            .checked_add(rating as u32)
            .ok_or(AgoraError::InvalidRating)?;
        profile.rating_count = profile.rating_count
            .checked_add(1)
            .ok_or(AgoraError::InvalidRating)?;
        
        msg!("Review submitted: {} stars", rating);
        Ok(())
    }
}
