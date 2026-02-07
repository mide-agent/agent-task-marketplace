use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;

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

pub fn handler(ctx: Context<ReleasePayment>, milestone_index: u8) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let escrow = &mut ctx.accounts.escrow;
    let index = milestone_index as usize;
    
    require!(index < task.milestones.len(), ErrorCode::InvalidMilestoneIndex);
    
    let milestone = &mut task.milestones[index];
    require!(milestone.completed, ErrorCode::MilestoneNotCompleted);
    require!(!milestone.paid, ErrorCode::MilestoneAlreadyPaid);
    
    // Save amount before we modify
    let amount = milestone.amount;
    
    // Mark milestone as paid
    milestone.paid = true;
    
    // Check if all milestones are paid BEFORE the transfer (avoids borrow issues)
    let all_paid = task.milestones.iter().all(|m| m.paid);
    if all_paid {
        task.status = TaskStatus::Completed;
    }
    
    // Transfer payment to freelancer
    let escrow_key = escrow.key();
    let seeds = &[
        b"escrow",
        escrow_key.as_ref(),
        &[escrow.bump],
    ];
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
    
    escrow.released_amount = escrow.released_amount.checked_add(amount).unwrap();
    
    msg!("Payment released for milestone {}: {}", milestone_index, amount);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid milestone index")]
    InvalidMilestoneIndex,
    #[msg("Milestone not completed")]
    MilestoneNotCompleted,
    #[msg("Milestone already paid")]
    MilestoneAlreadyPaid,
}
