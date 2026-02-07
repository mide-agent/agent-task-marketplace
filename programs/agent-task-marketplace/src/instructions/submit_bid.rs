use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(proposal: String)]
pub struct SubmitBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.status == TaskStatus::Open,
        constraint = task.owner != bidder.key()
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        init,
        payer = bidder,
        space = Bid::space()
    )]
    pub bid: Account<'info, Bid>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SubmitBid>,
    amount: u64,
    timeline: i64,
    proposal: String,
) -> Result<()> {
    require!(proposal.len() <= Bid::MAX_PROPOSAL_LEN, ErrorCode::ProposalTooLong);
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(timeline > 0, ErrorCode::InvalidTimeline);
    
    let clock = Clock::get()?;
    let task = &ctx.accounts.task;
    require!(clock.unix_timestamp + timeline <= task.deadline, ErrorCode::TimelineExceedsDeadline);
    
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

#[error_code]
pub enum ErrorCode {
    #[msg("Proposal too long")]
    ProposalTooLong,
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Timeline must be greater than 0")]
    InvalidTimeline,
    #[msg("Timeline exceeds task deadline")]
    TimelineExceedsDeadline,
}
