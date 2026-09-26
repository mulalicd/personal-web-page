# Legacy migrations (not applied)

These 15 files were written for the old Lovable-managed Supabase project
`zihohzstvbdobxahjfsy`, which no longer exists (2026-09-26).

They are kept for history only and are **never** applied. They were replaced
by one reviewed migration for the new project `qixpdeqjrkvfurqhzvtc`:
`supabase/migrations/20260926000000_initial_schema.sql`.

Deliberate differences from the legacy set:
- No "first registered user becomes admin" trigger (security hole: public
  sign-up + auto-admin). The admin role is assigned explicitly.
- No anonymous INSERT policies — every public write goes through an Edge
  Function that applies rate limiting and validation.
- Only `check_rate_limit_v2` (the v1 function was superseded).
- Private storage bucket `cv` for the approval-gated CV download.
