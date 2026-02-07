use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct RequestRefund<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == client.key(),
        constraint = task.status != TaskStatus::Completed
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
        constraint = client_token_account.owner == client.key(),
        constraint = client_token_account.mint == escrow.token_mint
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RequestRefund>) -> Result<()> {
    let task = &ctx.accounts.task;
    let escrow = &ctx.accounts.escrow;
    
    let clock = Clock::get()?;
    
    // Allow refund if task is cancelled or deadline passed with no progress
    require!(
        task.status == TaskStatus::Cancelled || 
        (clock.unix_timestamp > task.deadline && escrow.released_amount == 0),
        ErrorCode::RefundNotAllowed
    );
    
    // Calculate refund amount (total - already released)
    let refund_amount = escrow.total_amount - escrow.released_amount;
    require!(refund_amount > 0, ErrorCode::NoFundsToRefund);
    
    // Transfer refund to client
    let escrow_key = escrow.key();
    let seeds = &[
        b"escrow",
        escrow_key.as_ref(),
        &[escrow.bump],
    ];
    let signer = &[&seeds[..]];
    
    let transfer_instruction = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.client_token_account.to_account_info(),
        authority: escrow.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        signer,
    );
    
    token::transfer(cpi_ctx, refund_amount)?;
    
    msg!("Refund issued: {}", refund_amount);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Refund not allowed for this task state")]
    RefundNotAllowed,
    #[msg("No funds available for refund")]
    NoFundsToRefund,
}
