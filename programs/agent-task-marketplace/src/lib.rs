use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod state;
pub mod instructions;

use state::*;

#[program]
pub mod agent_task_marketplace {
    use super::*;

    pub fn post_task(
        ctx: Context<instructions::post_task::PostTask>,
        title: String,
        description: String,
        budget: u64,
        milestones: Vec<Milestone>,
        deadline: i64,
    ) -> Result<()> {
        instructions::post_task::handler(ctx, title, description, budget, milestones, deadline)
    }

    pub fn update_task(
        ctx: Context<instructions::update_task::UpdateTask>,
        description: Option<String>,
        budget: Option<u64>,
        deadline: Option<i64>,
    ) -> Result<()> {
        instructions::update_task::handler(ctx, description, budget, deadline)
    }

    pub fn cancel_task(ctx: Context<instructions::cancel_task::CancelTask>) -> Result<()> {
        instructions::cancel_task::handler(ctx)
    }

    pub fn submit_bid(
        ctx: Context<instructions::submit_bid::SubmitBid>,
        amount: u64,
        timeline: i64,
        proposal: String,
    ) -> Result<()> {
        instructions::submit_bid::handler(ctx, amount, timeline, proposal)
    }

    pub fn accept_bid(ctx: Context<instructions::accept_bid::AcceptBid>) -> Result<()> {
        instructions::accept_bid::handler(ctx)
    }

    pub fn reject_bid(ctx: Context<instructions::reject_bid::RejectBid>) -> Result<()> {
        instructions::reject_bid::handler(ctx)
    }

    pub fn withdraw_bid(ctx: Context<instructions::withdraw_bid::WithdrawBid>) -> Result<()> {
        instructions::withdraw_bid::handler(ctx)
    }

    pub fn fund_escrow(ctx: Context<instructions::fund_escrow::FundEscrow>) -> Result<()> {
        instructions::fund_escrow::handler(ctx)
    }

    pub fn complete_milestone(ctx: Context<instructions::complete_milestone::CompleteMilestone>, milestone_index: u8) -> Result<()> {
        instructions::complete_milestone::handler(ctx, milestone_index)
    }

    pub fn release_payment(ctx: Context<instructions::release_payment::ReleasePayment>, milestone_index: u8) -> Result<()> {
        instructions::release_payment::handler(ctx, milestone_index)
    }

    pub fn request_refund(ctx: Context<instructions::request_refund::RequestRefund>) -> Result<()> {
        instructions::request_refund::handler(ctx)
    }

    pub fn submit_review(
        ctx: Context<instructions::submit_review::SubmitReview>,
        rating: u8,
        review_text: String,
    ) -> Result<()> {
        instructions::submit_review::handler(ctx, rating, review_text)
    }

    pub fn initialize_agent_profile(ctx: Context<instructions::initialize_agent_profile::InitializeAgentProfile>, name: String) -> Result<()> {
        instructions::initialize_agent_profile::handler(ctx, name)
    }
}

#[derive(Accounts)]
pub struct Initialize {}

pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
    Ok(())
}
