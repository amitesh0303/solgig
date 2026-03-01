use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(
    title: String,
    description_uri: String,
    budget: u64,
    milestones: Vec<MilestoneInput>,
    job_id: u64
)]
pub struct CreateJob<'info> {
    /// The client creating and paying for the job account.
    #[account(mut)]
    pub client: Signer<'info>,

    /// Job PDA – unique per (client, job_id) pair.
    #[account(
        init,
        payer = client,
        space = Job::SPACE,
        seeds = [b"job", client.key().as_ref(), &job_id.to_le_bytes()],
        bump,
    )]
    pub job: Account<'info, Job>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(
    ctx: Context<CreateJob>,
    title: String,
    description_uri: String,
    budget: u64,
    milestones: Vec<MilestoneInput>,
    job_id: u64,
) -> Result<()> {
    // ── Input validation ────────────────────────────────────────────────────
    require!(title.len() <= MAX_TITLE_LEN, SolGigError::TitleTooLong);
    require!(
        description_uri.len() <= MAX_URI_LEN,
        SolGigError::DescriptionUriTooLong
    );
    require!(budget > 0, SolGigError::InvalidBudget);
    require!(!milestones.is_empty(), SolGigError::NoMilestones);
    require!(
        milestones.len() <= MAX_MILESTONES,
        SolGigError::TooManyMilestones
    );

    // Validate each milestone and compute the sum in one pass to avoid a second
    // iteration. Use checked arithmetic to guard against u64 overflow.
    let milestone_total = milestones
        .iter()
        .try_fold(0u64, |acc, m| {
            require!(m.title.len() <= MAX_TITLE_LEN, SolGigError::MilestoneTitleTooLong);
            require!(m.amount > 0, SolGigError::InvalidMilestoneAmount);
            acc.checked_add(m.amount).ok_or_else(|| error!(SolGigError::Overflow))
        })?;

    require!(milestone_total == budget, SolGigError::MilestoneAmountMismatch);

    // ── Populate account ────────────────────────────────────────────────────
    let job = &mut ctx.accounts.job;
    let clock = Clock::get()?;

    job.client = ctx.accounts.client.key();
    job.freelancer = None;
    job.title = title;
    job.description_uri = description_uri;
    job.budget = budget;
    job.milestones = milestones
        .into_iter()
        .map(|m| Milestone {
            title: m.title,
            amount: m.amount,
            status: MilestoneStatus::Pending,
        })
        .collect();
    job.status = JobStatus::Open;
    job.created_at = clock.unix_timestamp;
    job.job_id = job_id;
    job.bump = ctx.bumps.job;

    Ok(())
}
