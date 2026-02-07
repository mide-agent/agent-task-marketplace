use anchor_lang::prelude::*;
use crate::state::*;

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

pub fn handler(ctx: Context<AcceptBid>) -> Result<()> {
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
