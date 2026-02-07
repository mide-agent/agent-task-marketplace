use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod agent_task_marketplace {
    use super::*;

    pub fn post_task(
        ctx: Context<PostTask>,
        title: String,
        description: String,
        budget: u64,
        milestones: Vec<Milestone>,
        deadline: i64,
    ) -> Result<()> {
        instructions::post_task::handler(ctx, title, description, budget, milestones, deadline)
    }

    pub fn update_task(
        ctx: Context<UpdateTask>,
        description: Option<String>,
        budget: Option<u64>,
        deadline: Option<i64>,
    ) -> Result<()> {
        instructions::update_task::handler(ctx, description, budget, deadline)
    }

    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        instructions::cancel_task::handler(ctx)
    }

    pub fn submit_bid(
        ctx: Context<SubmitBid>,
        amount: u64,
        timeline: i64,
        proposal: String,
    ) -> Result<()> {
        instructions::submit_bid::handler(ctx, amount, timeline, proposal)
    }

    pub fn accept_bid(ctx: Context<AcceptBid>) -> Result<()> {
        instructions::accept_bid::handler(ctx)
    }

    pub fn reject_bid(ctx: Context<RejectBid>) -> Result<()> {
        instructions::reject_bid::handler(ctx)
    }

    pub fn withdraw_bid(ctx: Context<WithdrawBid>) -> Result<()> {
        instructions::withdraw_bid::handler(ctx)
    }

    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        instructions::fund_escrow::handler(ctx)
    }

    pub fn complete_milestone(ctx: Context<CompleteMilestone>, milestone_index: u8) -> Result<()> {
        instructions::complete_milestone::handler(ctx, milestone_index)
    }

    pub fn release_payment(ctx: Context<ReleasePayment>, milestone_index: u8) -> Result<()> {
        instructions::release_payment::handler(ctx, milestone_index)
    }

    pub fn request_refund(ctx: Context<RequestRefund>) -> Result<()> {
        instructions::request_refund::handler(ctx)
    }

    pub fn submit_review(
        ctx: Context<SubmitReview>,
        rating: u8,
        review_text: String,
    ) -> Result<()> {
        instructions::submit_review::handler(ctx, rating, review_text)
    }

    pub fn initialize_agent_profile(ctx: Context<InitializeAgentProfile>, name: String) -> Result<()> {
        instructions::initialize_agent_profile::handler(ctx, name)
    }
}

#[derive(Accounts)]
pub struct Initialize {}

pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
    Ok(())
}
