use anchor_lang::prelude::*;

/// Maximum byte length for job and milestone titles.
pub const MAX_TITLE_LEN: usize = 100;

/// Maximum byte length for IPFS/Arweave URI fields.
pub const MAX_URI_LEN: usize = 200;

/// Maximum byte length for a freelancer's application proposal.
pub const MAX_PROPOSAL_LEN: usize = 500;

/// Maximum number of milestones allowed per job.
pub const MAX_MILESTONES: usize = 10;

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/// Lifecycle state of a job posting.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum JobStatus {
    /// Job has been created and is accepting applications.
    Open,
    /// A freelancer has been hired and work is in progress.
    Active,
    /// All milestones have been approved and payment fully released.
    Complete,
    /// A dispute has been raised by one of the parties.
    Disputed,
    /// Job was cancelled before a freelancer was hired.
    Cancelled,
}

/// Lifecycle state of an individual milestone within a job.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MilestoneStatus {
    /// Milestone has not yet been worked on.
    Pending,
    /// Freelancer has marked the milestone as done; awaiting client approval.
    Complete,
    /// Client has approved the milestone and released the corresponding payment.
    Approved,
}

/// Lifecycle state of a freelancer's job application.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ApplicationStatus {
    /// Application submitted; awaiting client review.
    Pending,
    /// Client accepted this application.
    Accepted,
    /// Client rejected this application.
    Rejected,
}

// ---------------------------------------------------------------------------
// Embedded structs
// ---------------------------------------------------------------------------

/// A deliverable unit of work with its own payment allocation.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Milestone {
    /// Short human-readable title for the deliverable (max 100 bytes).
    pub title: String,
    /// Lamport amount reserved for this milestone.
    pub amount: u64,
    /// Current approval state of this milestone.
    pub status: MilestoneStatus,
}

impl Milestone {
    /// Serialised byte size of a single `Milestone` entry inside a `Vec`.
    pub const SPACE: usize = 4 + MAX_TITLE_LEN // title (length prefix + payload)
        + 8  // amount
        + 1; // status (enum discriminant)
}

/// Instruction-level input for a milestone (status is initialised to `Pending`).
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MilestoneInput {
    pub title: String,
    pub amount: u64,
}

// ---------------------------------------------------------------------------
// Account structs
// ---------------------------------------------------------------------------

/// On-chain representation of a job posting.
///
/// PDA seeds: `["job", client_pubkey, job_id_le_bytes]`
#[account]
pub struct Job {
    /// The wallet that created and owns this job.
    pub client: Pubkey,
    /// Assigned freelancer – set when an application is accepted.
    pub freelancer: Option<Pubkey>,
    /// Short title for the job (max 100 bytes).
    pub title: String,
    /// IPFS or Arweave URI pointing to the full job description (max 200 bytes).
    pub description_uri: String,
    /// Total budget in lamports; must equal the sum of all milestone amounts.
    pub budget: u64,
    /// Ordered list of deliverables (max 10).
    pub milestones: Vec<Milestone>,
    /// Current lifecycle state of the job.
    pub status: JobStatus,
    /// Unix timestamp when the job was created.
    pub created_at: i64,
    /// Client-assigned numeric identifier; used as a PDA seed for uniqueness.
    pub job_id: u64,
    /// Canonical PDA bump seed.
    pub bump: u8,
}

impl Job {
    pub const SPACE: usize = 8  // Anchor account discriminator
        + 32 // client
        + 1 + 32 // freelancer: Option<Pubkey>  (1-byte variant tag + pubkey)
        + 4 + MAX_TITLE_LEN // title
        + 4 + MAX_URI_LEN   // description_uri
        + 8  // budget
        + 4 + MAX_MILESTONES * Milestone::SPACE // milestones (vec length prefix + entries)
        + 1  // status
        + 8  // created_at
        + 8  // job_id
        + 1; // bump
}

/// Holds the job budget in escrow until milestones are approved.
///
/// PDA seeds: `["escrow", job_pubkey]`
#[account]
pub struct Escrow {
    /// The job this escrow belongs to.
    pub job: Pubkey,
    /// Wallet that funded the escrow.
    pub client: Pubkey,
    /// Wallet entitled to receive milestone payments.
    pub freelancer: Pubkey,
    /// Total lamports deposited (equals `job.budget`).
    pub amount: u64,
    /// Cumulative lamports already released to the freelancer.
    pub released: u64,
    /// Whether a dispute has been raised on this escrow.
    pub disputed: bool,
    /// Canonical PDA bump seed.
    pub bump: u8,
}

impl Escrow {
    pub const SPACE: usize = 8  // discriminator
        + 32 // job
        + 32 // client
        + 32 // freelancer
        + 8  // amount
        + 8  // released
        + 1  // disputed
        + 1; // bump
}

/// Immutable on-chain review left by one party about the other after job completion.
///
/// PDA seeds: `["review", author_pubkey, target_pubkey, job_pubkey]`
#[account]
pub struct Review {
    /// Wallet that wrote the review.
    pub author: Pubkey,
    /// Wallet being reviewed.
    pub target: Pubkey,
    /// The job that the review relates to.
    pub job: Pubkey,
    /// Star rating from 1 (worst) to 5 (best).
    pub rating: u8,
    /// IPFS/Arweave URI with extended review text (max 200 bytes).
    pub comment_uri: String,
    /// Unix timestamp when the review was created.
    pub created_at: i64,
    /// Canonical PDA bump seed.
    pub bump: u8,
}

impl Review {
    pub const SPACE: usize = 8  // discriminator
        + 32 // author
        + 32 // target
        + 32 // job
        + 1  // rating
        + 4 + MAX_URI_LEN // comment_uri
        + 8  // created_at
        + 1; // bump
}

/// A freelancer's application to work on a specific job.
///
/// PDA seeds: `["application", job_pubkey, freelancer_pubkey]`
#[account]
pub struct Application {
    /// Job being applied to.
    pub job: Pubkey,
    /// Freelancer submitting the application.
    pub freelancer: Pubkey,
    /// Cover-letter / proposal text (max 500 bytes).
    pub proposal: String,
    /// Freelancer's requested payment in lamports.
    pub proposed_budget: u64,
    /// Current state of the application.
    pub status: ApplicationStatus,
    /// Unix timestamp when the application was submitted.
    pub created_at: i64,
    /// Canonical PDA bump seed.
    pub bump: u8,
}

impl Application {
    pub const SPACE: usize = 8  // discriminator
        + 32 // job
        + 32 // freelancer
        + 4 + MAX_PROPOSAL_LEN // proposal
        + 8  // proposed_budget
        + 1  // status
        + 8  // created_at
        + 1; // bump
}
