use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    
    #[account(
        mut,
        constraint = task.owner == client.key(),
        constraint = task.status == TaskStatus::InProgress,
        constraint = task.accepted_bid.is_some()
    )]
    pub task: Account<'info, Task>,
    
    pub accepted_bid: Account<'info, Bid>,
    
    #[account(
        init,
        payer = client,
        space = Escrow::SIZE,
        seeds = [b"escrow", task.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        constraint = client_token_account.owner == client.key(),
        constraint = client_token_account.mint == token_mint.key()
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = client,
        token::mint = token_mint,
        token::authority = escrow,
        seeds = [b"escrow_token", escrow.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<FundEscrow>) -> Result<()> {
    let task = &ctx.accounts.task;
    let accepted_bid = &ctx.accounts.accepted_bid;
    
    // Transfer funds from client to escrow
    let transfer_instruction = Transfer {
        from: ctx.accounts.client_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.client.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, accepted_bid.amount)?;
    
    // Initialize escrow account
    let escrow = &mut ctx.accounts.escrow;
    escrow.task = ctx.accounts.task.key();
    escrow.client = ctx.accounts.client.key();
    escrow.freelancer = accepted_bid.bidder;
    escrow.total_amount = accepted_bid.amount;
    escrow.released_amount = 0;
    escrow.token_mint = ctx.accounts.token_mint.key();
    escrow.bump = ctx.bumps.escrow;
    
    msg!("Escrow funded with {} tokens", accepted_bid.amount);
    Ok(())
}
