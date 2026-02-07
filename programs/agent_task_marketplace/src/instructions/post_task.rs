use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(title: String, description: String, milestones: Vec<Milestone>)]
pub struct PostTask<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = Task::space(milestones.len())
    )]
    pub task: Account<'info, Task>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PostTask>,
    title: String,
    description: String,
    budget: u64,
    milestones: Vec<Milestone>,
    deadline: i64,
) -> Result<()> {
    require!(!title.is_empty(), ErrorCode::EmptyTitle);
    require!(title.len() <= Task::MAX_TITLE_LEN, ErrorCode::TitleTooLong);
    require!(description.len() <= Task::MAX_DESC_LEN, ErrorCode::DescriptionTooLong);
    require!(!milestones.is_empty(), ErrorCode::NoMilestones);
    require!(milestones.len() <= Task::MAX_MILESTONES, ErrorCode::TooManyMilestones);
    
    // Verify milestone amounts sum to budget
    let total: u64 = milestones.iter().map(|m| m.amount).sum();
    require!(total == budget, ErrorCode::MilestoneAmountMismatch);
    
    let clock = Clock::get()?;
    require!(deadline > clock.unix_timestamp, ErrorCode::InvalidDeadline);
    
    let task = &mut ctx.accounts.task;
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

#[error_code]
pub enum ErrorCode {
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
}
