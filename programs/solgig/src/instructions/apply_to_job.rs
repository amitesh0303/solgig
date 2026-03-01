use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(proposal: String, proposed_budget: u64)]
pub struct ApplyToJob<'info> {
    /// Freelancer submitting the application; pays the account rent.
    #[account(mut)]
    pub freelancer: Signer<'info>,

    /// Job being applied to – must be open and not yet filled.
    #[account(
        constraint = job.status == JobStatus::Open @ SolGigError::InvalidJobStatus,
        constraint = job.freelancer.is_none() @ SolGigError::JobAlreadyHasFreelancer,
        // Prevent the client from applying to their own job.
        constraint = job.client != freelancer.key() @ SolGigError::Unauthorized,
    )]
    pub job: Account<'info, Job>,

    /// Application PDA – one per (job, freelancer) pair, ensuring idempotency.
    #[account(
        init,
        payer = freelancer,
        space = Application::SPACE,
        seeds = [b"application", job.key().as_ref(), freelancer.key().as_ref()],
        bump,
    )]
    pub application: Account<'info, Application>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(
    ctx: Context<ApplyToJob>,
    proposal: String,
    proposed_budget: u64,
) -> Result<()> {
    require!(proposal.len() <= MAX_PROPOSAL_LEN, SolGigError::ProposalTooLong);
    require!(proposed_budget > 0, SolGigError::InvalidBudget);

    let application = &mut ctx.accounts.application;
    let clock = Clock::get()?;

    application.job = ctx.accounts.job.key();
    application.freelancer = ctx.accounts.freelancer.key();
    application.proposal = proposal;
    application.proposed_budget = proposed_budget;
    application.status = ApplicationStatus::Pending;
    application.created_at = clock.unix_timestamp;
    application.bump = ctx.bumps.application;

    Ok(())
}
