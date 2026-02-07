use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CancelTask<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == owner.key(),
        constraint = task.status == TaskStatus::Open || task.status == TaskStatus::InProgress,
        constraint = task.escrow_account.is_none()
    )]
    pub task: Account<'info, Task>,
}

pub fn handler(ctx: Context<CancelTask>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let clock = Clock::get()?;
    
    task.status = TaskStatus::Cancelled;
    task.updated_at = clock.unix_timestamp;
    
    msg!("Task cancelled: {}", task.title);
    Ok(())
}
