use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == owner.key(),
        constraint = task.status == TaskStatus::Open
    )]
    pub task: Account<'info, Task>,
}

pub fn handler(
    ctx: Context<UpdateTask>,
    description: Option<String>,
    budget: Option<u64>,
    deadline: Option<i64>,
) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let clock = Clock::get()?;
    
    if let Some(desc) = description {
        require!(desc.len() <= Task::MAX_DESC_LEN, ErrorCode::DescriptionTooLong);
        task.description = desc;
    }
    
    if let Some(bud) = budget {
        require!(bud > 0, ErrorCode::InvalidBudget);
        task.budget = bud;
    }
    
    if let Some(dl) = deadline {
        require!(dl > clock.unix_timestamp, ErrorCode::InvalidDeadline);
        task.deadline = dl;
    }
    
    task.updated_at = clock.unix_timestamp;
    
    msg!("Task updated: {}", task.title);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Budget must be greater than 0")]
    InvalidBudget,
    #[msg("Deadline must be in the future")]
    InvalidDeadline,
}
