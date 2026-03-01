use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Dispute<'info> {
    /// Either the client or the freelancer may raise a dispute.
    pub authority: Signer<'info>,

    /// The active job. The constraint verifies the signer is a party to the job.
    #[account(
        mut,
        constraint = (
            job.client == authority.key() ||
            job.freelancer == Some(authority.key())
        ) @ SolGigError::Unauthorized,
        constraint = job.status == JobStatus::Active @ SolGigError::InvalidJobStatus,
    )]
    pub job: Account<'info, Job>,

    /// Escrow for this job. Verified by PDA seeds.
    /// A second `disputed` guard prevents raising a dispute twice.
    #[account(
        mut,
        seeds = [b"escrow", job.key().as_ref()],
        bump = escrow.bump,
        constraint = !escrow.disputed @ SolGigError::JobDisputed,
    )]
    pub escrow: Account<'info, Escrow>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<Dispute>) -> Result<()> {
    ctx.accounts.job.status = JobStatus::Disputed;
    ctx.accounts.escrow.disputed = true;
    Ok(())
}
