use anchor_lang::prelude::*;

#[error_code]
pub enum SolGigError {
    // ── Authorisation ──────────────────────────────────────────────────────
    #[msg("You are not authorised to perform this action")]
    Unauthorized,

    // ── Input validation – lengths ─────────────────────────────────────────
    #[msg("Job title exceeds the maximum of 100 bytes")]
    TitleTooLong,

    #[msg("Description URI exceeds the maximum of 200 bytes")]
    DescriptionUriTooLong,

    #[msg("Proposal text exceeds the maximum of 500 bytes")]
    ProposalTooLong,

    #[msg("Comment URI exceeds the maximum of 200 bytes")]
    CommentUriTooLong,

    #[msg("Milestone title exceeds the maximum of 100 bytes")]
    MilestoneTitleTooLong,

    // ── Input validation – values ──────────────────────────────────────────
    #[msg("Budget must be greater than zero")]
    InvalidBudget,

    #[msg("Milestone amount must be greater than zero")]
    InvalidMilestoneAmount,

    #[msg("At least one milestone is required")]
    NoMilestones,

    #[msg("A job may have at most 10 milestones")]
    TooManyMilestones,

    #[msg("The sum of milestone amounts must equal the job budget")]
    MilestoneAmountMismatch,

    #[msg("Rating must be between 1 and 5 (inclusive)")]
    InvalidRating,

    // ── Job / escrow state ─────────────────────────────────────────────────
    #[msg("The job is not in the required status for this operation")]
    InvalidJobStatus,

    #[msg("The job does not have a freelancer assigned yet")]
    FreelancerNotAssigned,

    #[msg("This job already has a freelancer assigned")]
    JobAlreadyHasFreelancer,

    #[msg("Reviews can only be left once the job is complete")]
    JobNotComplete,

    #[msg("This job is currently in a disputed state")]
    JobDisputed,

    #[msg("This escrow is not in a disputed state")]
    NotDisputed,

    #[msg("The escrow has already been funded")]
    EscrowAlreadyFunded,

    #[msg("Insufficient unreleased escrow funds for this operation")]
    InsufficientFunds,

    // ── Milestone state ────────────────────────────────────────────────────
    #[msg("Milestone index is out of range")]
    InvalidMilestoneIndex,

    #[msg("Milestone has not been marked complete by the freelancer")]
    MilestoneNotComplete,

    #[msg("Milestone has already been approved and paid")]
    MilestoneAlreadyApproved,

    #[msg("Milestone must be in Pending state to be marked complete")]
    MilestoneNotPending,

    // ── Application state ──────────────────────────────────────────────────
    #[msg("The application does not belong to this job")]
    InvalidApplication,

    #[msg("The application is no longer in Pending status")]
    ApplicationNotPending,

    #[msg("The application has not been accepted")]
    ApplicationNotAccepted,

    // ── Arithmetic ─────────────────────────────────────────────────────────
    #[msg("Escrow state is inconsistent (released > amount); this should never happen")]
    InvalidEscrowState,
    #[msg("Arithmetic overflow")]
    Overflow,
}
