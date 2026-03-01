use anchor_lang::prelude::*;

use crate::error::SolGigError;
use crate::state::*;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    /// Platform admin – the only wallet permitted to resolve disputes.
    /// Verified against the hardcoded `ADMIN_PUBKEY` constant in `lib.rs`.
    #[account(
        constraint = admin.key() == crate::ADMIN_PUBKEY @ SolGigError::Unauthorized,
    )]
    pub admin: Signer<'info>,

    /// The disputed job.
    #[account(
        mut,
        constraint = job.status == JobStatus::Disputed @ SolGigError::NotDisputed,
    )]
    pub job: Account<'info, Job>,

    /// Escrow holding the frozen funds. Closed at the end of this instruction
    /// so the rent-exempt lamports are returned to the client.
    #[account(
        mut,
        seeds = [b"escrow", job.key().as_ref()],
        bump = escrow.bump,
        has_one = client @ SolGigError::Unauthorized,
        has_one = freelancer @ SolGigError::Unauthorized,
        constraint = escrow.disputed @ SolGigError::NotDisputed,
        close = client,
    )]
    pub escrow: Account<'info, Escrow>,

    /// Client wallet. Must match `escrow.client` (enforced by `has_one`).
    ///
    /// CHECK: Safe – identity verified by the `has_one = client` constraint above.
    #[account(mut)]
    pub client: AccountInfo<'info>,

    /// Freelancer wallet. Must match `escrow.freelancer` (enforced by `has_one`).
    ///
    /// CHECK: Safe – identity verified by the `has_one = freelancer` constraint above.
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<ResolveDispute>, release_to_freelancer: bool) -> Result<()> {
    // Calculate the unreleased portion of the escrowed budget.
    let unreleased = ctx
        .accounts
        .escrow
        .amount
        .checked_sub(ctx.accounts.escrow.released)
        .ok_or(SolGigError::Overflow)?;

    // Transfer the unreleased funds to the winner of the dispute.
    // The `close = client` attribute on the escrow account will transfer any
    // remaining lamports (i.e. the rent) to the client after this handler returns,
    // so we only need to move the budget portion here.
    if unreleased > 0 {
        if release_to_freelancer {
            // Freelancer wins: send unreleased budget to freelancer.
            **ctx
                .accounts
                .escrow
                .to_account_info()
                .try_borrow_mut_lamports()? -= unreleased;
            **ctx
                .accounts
                .freelancer
                .to_account_info()
                .try_borrow_mut_lamports()? += unreleased;
        } else {
            // Client wins: refund unreleased budget to client.
            // The subsequent `close = client` will also send the rent to client.
            **ctx
                .accounts
                .escrow
                .to_account_info()
                .try_borrow_mut_lamports()? -= unreleased;
            **ctx
                .accounts
                .client
                .to_account_info()
                .try_borrow_mut_lamports()? += unreleased;
        }
    }

    // Mark job as complete regardless of who received the funds.
    ctx.accounts.job.status = JobStatus::Complete;

    Ok(())
}
