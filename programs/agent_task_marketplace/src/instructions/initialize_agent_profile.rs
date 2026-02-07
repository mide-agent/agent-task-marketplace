use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(name: String)]
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

pub fn handler(ctx: Context<InitializeAgentProfile>, name: String) -> Result<()> {
    require!(name.len() <= AgentProfile::MAX_NAME_LEN, ErrorCode::NameTooLong);
    
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

#[error_code]
pub enum ErrorCode {
    #[msg("Name too long")]
    NameTooLong,
}
