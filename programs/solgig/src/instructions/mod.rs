pub mod accept_application;
pub mod apply_to_job;
pub mod complete_milestone;
pub mod create_job;
pub mod dispute;
pub mod fund_escrow;
pub mod leave_review;
pub mod release_payment;
pub mod resolve_dispute;

// Glob re-exports are required so that the auto-generated `__client_accounts_X`
// modules (produced by #[derive(Accounts)]) are visible at the crate root, which
// the Anchor #[program] macro needs for IDL and CPI generation.
// The resulting `handler` name ambiguity is intentional and only a warning.
pub use accept_application::*;
pub use apply_to_job::*;
pub use complete_milestone::*;
pub use create_job::*;
pub use dispute::*;
pub use fund_escrow::*;
pub use leave_review::*;
pub use release_payment::*;
pub use resolve_dispute::*;
