use anchor_lang::prelude::*;
use crate::state::*;

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

pub fn handler(ctx: Context<CompleteMilestone>, milestone_index: u8) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let index = milestone_index as usize;
    
    require!(index < task.milestones.len(), ErrorCode::InvalidMilestoneIndex);
    
    let milestone = &mut task.milestones[index];
    require!(!milestone.completed, ErrorCode::MilestoneAlreadyCompleted);
    
    milestone.completed = true;
    
    msg!("Milestone {} marked as completed", milestone_index);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid milestone index")]
    InvalidMilestoneIndex,
    #[msg("Milestone already completed")]
    MilestoneAlreadyCompleted,
}
