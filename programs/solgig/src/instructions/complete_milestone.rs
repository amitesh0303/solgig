use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct CompleteMilestone<'info> {
    /// The hired freelancer – only they may signal milestone completion.
    pub freelancer: Signer<'info>,

    /// The active job. The freelancer constraint verifies the signer is the
    /// assigned worker.
    #[account(
        mut,
        constraint = job.freelancer == Some(freelancer.key()) @ SolGigError::Unauthorized,
        constraint = job.status == JobStatus::Active @ SolGigError::InvalidJobStatus,
    )]
    pub job: Account<'info, Job>,

    /// Escrow for this job – verified by PDA seeds. A dispute check prevents
    /// milestone actions while funds are frozen.
    #[account(
        seeds = [b"escrow", job.key().as_ref()],
        bump = escrow.bump,
        constraint = !escrow.disputed @ SolGigError::JobDisputed,
    )]
    pub escrow: Account<'info, Escrow>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<CompleteMilestone>, milestone_index: u8) -> Result<()> {
    let job = &mut ctx.accounts.job;
    let idx = milestone_index as usize;

    require!(idx < job.milestones.len(), SolGigError::InvalidMilestoneIndex);

    // Milestone must be Pending; Complete means already submitted, Approved means already paid.
    require!(
        job.milestones[idx].status == MilestoneStatus::Pending,
        SolGigError::MilestoneNotPending
    );

    job.milestones[idx].status = MilestoneStatus::Complete;

    Ok(())
}
