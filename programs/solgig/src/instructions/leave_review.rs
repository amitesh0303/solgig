use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(rating: u8, comment_uri: String)]
pub struct LeaveReview<'info> {
    /// The reviewer (client or freelancer); pays the review account rent.
    #[account(mut)]
    pub author: Signer<'info>,

    /// The wallet being reviewed; must be the other party in the job.
    ///
    /// CHECK: Safe – we verify `target` is either the client or the freelancer
    /// via the constraints on `job` below, and that author ≠ target.
    pub target: AccountInfo<'info>,

    /// The completed job the review relates to.
    /// Both author and target must be parties to this job.
    #[account(
        constraint = job.status == JobStatus::Complete @ SolGigError::JobNotComplete,
        // Author must be a party to the job.
        constraint = (
            job.client == author.key() ||
            job.freelancer == Some(author.key())
        ) @ SolGigError::Unauthorized,
        // Target must be the other party.
        constraint = (
            job.client == target.key() ||
            job.freelancer == Some(target.key())
        ) @ SolGigError::Unauthorized,
        // Prevent self-review.
        constraint = author.key() != target.key() @ SolGigError::Unauthorized,
    )]
    pub job: Account<'info, Job>,

    /// Review PDA – unique per (author, target, job), so each party can only
    /// leave one review per job.
    #[account(
        init,
        payer = author,
        space = Review::SPACE,
        seeds = [b"review", author.key().as_ref(), target.key().as_ref(), job.key().as_ref()],
        bump,
    )]
    pub review: Account<'info, Review>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<LeaveReview>, rating: u8, comment_uri: String) -> Result<()> {
    require!(rating >= 1 && rating <= 5, SolGigError::InvalidRating);
    require!(comment_uri.len() <= MAX_URI_LEN, SolGigError::CommentUriTooLong);

    let review = &mut ctx.accounts.review;
    let clock = Clock::get()?;

    review.author = ctx.accounts.author.key();
    review.target = ctx.accounts.target.key();
    review.job = ctx.accounts.job.key();
    review.rating = rating;
    review.comment_uri = comment_uri;
    review.created_at = clock.unix_timestamp;
    review.bump = ctx.bumps.review;

    Ok(())
}
