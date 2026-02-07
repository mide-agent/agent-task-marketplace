use anchor_lang::prelude::*;
use crate::state::*;

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

pub fn handler(ctx: Context<RejectBid>) -> Result<()> {
    let bid = &mut ctx.accounts.bid;
    bid.status = BidStatus::Rejected;
    
    msg!("Bid rejected for task: {:?}", bid.task);
    Ok(())
}
