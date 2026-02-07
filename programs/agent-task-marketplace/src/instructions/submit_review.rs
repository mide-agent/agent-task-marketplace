use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(rating: u8, review_text: String)]
pub struct SubmitReview<'info> {
    #[account(mut)]
    pub reviewer: Signer<'info>,
    
    #[account(
        constraint = task.status == TaskStatus::Completed,
        constraint = task.owner == reviewer.key() || is_freelancer(&task, &reviewer.key(), &bid
        )
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        constraint = bid.task == task.key()
    )]
    pub bid: Account<'info, Bid>,
    
    /// CHECK: Reviewee is the other party in the task
    #[account(
        mut,
        constraint = reviewee.key() != reviewer.key()
    )]
    pub reviewee: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"profile", reviewee.key().as_ref()],
        bump
    )]
    pub reviewee_profile: Account<'info, AgentProfile>,
    
    #[account(
        init,
        payer = reviewer,
        space = Review::space()
    )]
    pub review: Account<'info, Review>,
    
    pub system_program: Program<'info, System>,
}

fn is_freelancer(task: &Task, reviewer: &Pubkey, bid: &Bid) -> bool {
    task.accepted_bid.is_some() && bid.bidder == *reviewer
}

pub fn handler(ctx: Context<SubmitReview>, rating: u8, review_text: String) -> Result<()> {
    require!(rating >= 1 && rating <= 5, ErrorCode::InvalidRating);
    require!(review_text.len() <= Review::MAX_REVIEW_LEN, ErrorCode::ReviewTooLong);
    
    let clock = Clock::get()?;
    
    // Create review
    let review = &mut ctx.accounts.review;
    review.reviewer = ctx.accounts.reviewer.key();
    review.reviewee = ctx.accounts.reviewee.key();
    review.task = ctx.accounts.task.key();
    review.rating = rating;
    review.review_text = review_text;
    review.created_at = clock.unix_timestamp;
    
    // Update reviewee profile
    let profile = &mut ctx.accounts.reviewee_profile;
    profile.rating_sum = profile.rating_sum.checked_add(rating as u32).unwrap();
    profile.rating_count = profile.rating_count.checked_add(1).unwrap();
    
    msg!("Review submitted: {} stars", rating);
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Review too long")]
    ReviewTooLong,
}
