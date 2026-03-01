use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    /// The job's client – only they may approve milestones and release funds.
    #[account(mut)]
    pub client: Signer<'info>,

    /// The active job belonging to this client.
    #[account(
        mut,
        constraint = job.client == client.key() @ SolGigError::Unauthorized,
        constraint = job.status == JobStatus::Active @ SolGigError::InvalidJobStatus,
    )]
    pub job: Account<'info, Job>,

    /// Escrow holding the locked budget. Verified by PDA seeds.
    #[account(
        mut,
        seeds = [b"escrow", job.key().as_ref()],
        bump = escrow.bump,
        constraint = !escrow.disputed @ SolGigError::JobDisputed,
    )]
    pub escrow: Account<'info, Escrow>,

    /// Freelancer wallet that receives the milestone payment.
    ///
    /// CHECK: Safe – we verify against `escrow.freelancer` below.
    #[account(
        mut,
        constraint = freelancer.key() == escrow.freelancer @ SolGigError::Unauthorized,
    )]
    pub freelancer: AccountInfo<'info>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<ReleasePayment>, milestone_index: u8) -> Result<()> {
    let idx = milestone_index as usize;

    // ── Validate milestone state ────────────────────────────────────────────
    require!(
        idx < ctx.accounts.job.milestones.len(),
        SolGigError::InvalidMilestoneIndex
    );
    require!(
        ctx.accounts.job.milestones[idx].status == MilestoneStatus::Complete,
        SolGigError::MilestoneNotComplete
    );

    let amount = ctx.accounts.job.milestones[idx].amount;

    // Ensure the escrow still holds enough unreleased funds.
    let new_released = ctx
        .accounts
        .escrow
        .released
        .checked_add(amount)
        .ok_or(SolGigError::Overflow)?;
    require!(
        new_released <= ctx.accounts.escrow.amount,
        SolGigError::InsufficientFunds
    );

    // ── Update state ────────────────────────────────────────────────────────
    ctx.accounts.job.milestones[idx].status = MilestoneStatus::Approved;
    ctx.accounts.escrow.released = new_released;

    // If every milestone is now approved, mark the job complete.
    let all_approved = ctx
        .accounts
        .job
        .milestones
        .iter()
        .all(|m| m.status == MilestoneStatus::Approved);

    if all_approved {
        ctx.accounts.job.status = JobStatus::Complete;
    }

    // ── Transfer lamports from escrow to freelancer ─────────────────────────
    // The escrow is a PDA so it cannot sign for `system_program::transfer`.
    // Direct lamport manipulation is the canonical Anchor pattern for PDA payouts.
    **ctx
        .accounts
        .escrow
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount;
    **ctx
        .accounts
        .freelancer
        .to_account_info()
        .try_borrow_mut_lamports()? += amount;

    Ok(())
}
