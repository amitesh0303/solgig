use anchor_lang::prelude::*;
use solana_program::pubkey;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::MilestoneInput;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// IMPORTANT: Replace this with the actual admin public key before mainnet deployment.
///
/// The admin is the only wallet permitted to call `resolve_dispute`. A multisig
/// or governance program can be used here for additional security.
pub const ADMIN_PUBKEY: Pubkey = pubkey!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solgig {
    use super::*;

    /// Create a new job listing.
    ///
    /// The client specifies a title, an IPFS description URI, a total budget (in
    /// lamports), and an ordered list of milestones whose amounts must sum to the
    /// budget. A unique `job_id` is used as a PDA seed so the same client can post
    /// multiple jobs.
    pub fn create_job(
        ctx: Context<CreateJob>,
        title: String,
        description_uri: String,
        budget: u64,
        milestones: Vec<MilestoneInput>,
        job_id: u64,
    ) -> Result<()> {
        instructions::create_job::handler(ctx, title, description_uri, budget, milestones, job_id)
    }

    /// Submit an application to an open job.
    ///
    /// Any wallet other than the client can apply. A freelancer may only have one
    /// active application per job (enforced by the PDA uniqueness constraint).
    pub fn apply_to_job(
        ctx: Context<ApplyToJob>,
        proposal: String,
        proposed_budget: u64,
    ) -> Result<()> {
        instructions::apply_to_job::handler(ctx, proposal, proposed_budget)
    }

    /// Accept one of the applications for a job.
    ///
    /// Sets the freelancer on the job and transitions its status to `Active`.
    /// Only the client who created the job may call this.
    pub fn accept_application(ctx: Context<AcceptApplication>) -> Result<()> {
        instructions::accept_application::handler(ctx)
    }

    /// Fund the escrow for an active job.
    ///
    /// Transfers `job.budget` lamports from the client into the escrow PDA.
    /// Must be called after `accept_application` and before work begins.
    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        instructions::fund_escrow::handler(ctx)
    }

    /// Freelancer marks a milestone as complete.
    ///
    /// This signals to the client that the deliverable is ready for review.
    /// The milestone index is zero-based.
    pub fn complete_milestone(
        ctx: Context<CompleteMilestone>,
        milestone_index: u8,
    ) -> Result<()> {
        instructions::complete_milestone::handler(ctx, milestone_index)
    }

    /// Client approves a completed milestone and releases the corresponding payment.
    ///
    /// Transfers `milestone.amount` lamports from the escrow PDA to the freelancer.
    /// When all milestones are approved the job is automatically marked `Complete`.
    pub fn release_payment(
        ctx: Context<ReleasePayment>,
        milestone_index: u8,
    ) -> Result<()> {
        instructions::release_payment::handler(ctx, milestone_index)
    }

    /// Raise a dispute on an active job.
    ///
    /// Either the client or the freelancer may call this. Locks all further
    /// milestone operations until the dispute is resolved by the admin.
    pub fn dispute(ctx: Context<Dispute>) -> Result<()> {
        instructions::dispute::handler(ctx)
    }

    /// Admin resolves a disputed job.
    ///
    /// Transfers all unreleased escrow funds either to the freelancer
    /// (`release_to_freelancer = true`) or back to the client
    /// (`release_to_freelancer = false`). Closes the escrow account and
    /// returns the rent to the client.
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        release_to_freelancer: bool,
    ) -> Result<()> {
        instructions::resolve_dispute::handler(ctx, release_to_freelancer)
    }

    /// Leave a star rating and comment for the other party after job completion.
    ///
    /// Both the client and the freelancer may each leave one review (enforced by
    /// PDA uniqueness). The job must be in the `Complete` state.
    pub fn leave_review(
        ctx: Context<LeaveReview>,
        rating: u8,
        comment_uri: String,
    ) -> Result<()> {
        instructions::leave_review::handler(ctx, rating, comment_uri)
    }
}
