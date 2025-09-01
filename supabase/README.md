# Supabase schema and applying migrations

This folder contains the initial schema migration for Let'sChat and safe instructions to apply it.

Files:
- `migrations/001_create_schema.sql` — Creates `users`, `codes`, `rooms`, `room_participants`, `room_rows`, `logs` and RLS policies. It also drops older tables if present (destructive).

Important notes
- The migration contains `DROP TABLE IF EXISTS ...` statements for a clean start — this is destructive. Back up your existing database before running it.
- The migration adds `CREATE EXTENSION IF NOT EXISTS pgcrypto;` so `gen_random_uuid()` used in the user trigger works on databases without pgcrypto.

Apply with Supabase CLI (local / development):

1. Install the Supabase CLI and authenticate.
2. Run a reset/push on a development database only:

```bash
# WARNING: destructive on the selected DB
supabase db reset
supabase db push
```

Apply with psql (any Postgres connection):

```bash
psql "postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require" -f supabase/migrations/001_create_schema.sql
```

Testing the connection
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your environment (or in `.env.local`).
- Run the quick test script from project root:

```bash
# PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL="https://..."
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="anon..."
node scripts/test-supabase.js
```

If you want non-destructive migrations for production, remove the `DROP TABLE` lines and apply migration files incrementally.

If you want, I can:
- Convert the migration into non-destructive incremental migrations.
- Add a backup/restore helper script.
- Deploy and test functions in a Supabase project if you provide credentials or a db dump.

Testing the `finalize_join` function
------------------------------------

We created an atomic DB function `public.finalize_join(p_code, p_anonymous_id, p_pin)` in `migrations/002_finalize_join_fn.sql`.

How it behaves:
- Locks involved `codes` rows with `FOR UPDATE` to avoid race conditions.
- Validates PIN when required using `crypt` (pgcrypto).
- Creates a `room` if missing, links both halves, inserts participant if not present, and marks codes as used.

Quick test (local, uses service role key):

PowerShell example:
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "<your_service_role_key>"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://..."
node scripts/test-finalize-join.js A1234 00000000-0000-0000-000000000000
```

Returned value: `room_id` on success, error message on failure. Use this for validating the function before wiring UI.
