use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct AcceptApplication<'info> {
    /// The job's client – only they may accept applications.
    #[account(mut)]
    pub client: Signer<'info>,

    /// The job posting. Must be open and without an assigned freelancer.
    #[account(
        mut,
        constraint = job.client == client.key() @ SolGigError::Unauthorized,
        constraint = job.status == JobStatus::Open @ SolGigError::InvalidJobStatus,
        constraint = job.freelancer.is_none() @ SolGigError::JobAlreadyHasFreelancer,
    )]
    pub job: Account<'info, Job>,

    /// The application being accepted. The PDA seeds also act as an implicit
    /// proof that this application was created for this specific job + freelancer
    /// combination, so no extra `has_one` check is required.
    #[account(
        mut,
        seeds = [b"application", job.key().as_ref(), application.freelancer.as_ref()],
        bump = application.bump,
        constraint = application.job == job.key() @ SolGigError::InvalidApplication,
        constraint = application.status == ApplicationStatus::Pending @ SolGigError::ApplicationNotPending,
    )]
    pub application: Account<'info, Application>,

    /// The freelancer wallet being hired. Verified against the application record.
    ///
    /// CHECK: Safe – we enforce `freelancer.key() == application.freelancer` below.
    #[account(
        constraint = freelancer.key() == application.freelancer @ SolGigError::Unauthorized,
    )]
    pub freelancer: AccountInfo<'info>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<AcceptApplication>) -> Result<()> {
    let job = &mut ctx.accounts.job;
    let application = &mut ctx.accounts.application;

    // Assign the freelancer and transition job to Active.
    job.freelancer = Some(ctx.accounts.freelancer.key());
    job.status = JobStatus::Active;

    // Mark this application as accepted.
    application.status = ApplicationStatus::Accepted;

    Ok(())
}
