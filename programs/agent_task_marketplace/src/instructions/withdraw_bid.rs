use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct WithdrawBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    #[account(
        mut,
        constraint = bid.bidder == bidder.key(),
        constraint = bid.status == BidStatus::Pending,
        close = bidder
    )]
    pub bid: Account<'info, Bid>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawBid>) -> Result<()> {
    let bid = &mut ctx.accounts.bid;
    bid.status = BidStatus::Withdrawn;
    
    msg!("Bid withdrawn");
    Ok(())
}
