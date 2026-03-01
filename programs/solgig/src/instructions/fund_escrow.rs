use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    /// Client funding the escrow; also pays the rent for the new escrow account.
    #[account(mut)]
    pub client: Signer<'info>,

    /// Active job with an assigned freelancer.
    #[account(
        constraint = job.client == client.key() @ SolGigError::Unauthorized,
        constraint = job.status == JobStatus::Active @ SolGigError::InvalidJobStatus,
        constraint = job.freelancer.is_some() @ SolGigError::FreelancerNotAssigned,
    )]
    pub job: Account<'info, Job>,

    /// Escrow PDA that will hold the job budget until milestones are approved.
    /// Using `init` ensures this can only be funded once (re-init would fail).
    #[account(
        init,
        payer = client,
        space = Escrow::SPACE,
        seeds = [b"escrow", job.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<FundEscrow>) -> Result<()> {
    let job = &ctx.accounts.job;

    // The `is_some()` constraint above already guarantees Some; unwrap is safe.
    let freelancer = job.freelancer.unwrap();
    let budget = job.budget;

    // Initialise escrow state before transferring funds.
    let escrow = &mut ctx.accounts.escrow;
    escrow.job = ctx.accounts.job.key();
    escrow.client = ctx.accounts.client.key();
    escrow.freelancer = freelancer;
    escrow.amount = budget;
    escrow.released = 0;
    escrow.disputed = false;
    escrow.bump = ctx.bumps.escrow;

    // Transfer the full job budget from client to the escrow account.
    // The escrow account's rent (initialisation cost) was already paid above;
    // this separate transfer moves the actual work funds.
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        ),
        budget,
    )?;

    Ok(())
}
