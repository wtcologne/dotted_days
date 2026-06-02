# Monthly Challenge

A calm mobile-first web app for tracking one personal monthly challenge.

## V1 Scope

- One challenge per month
- Current month tracking with daily check-ins
- Monthly overview with 3 past months and 6 future months
- Future month planning with curated challenge suggestions
- Local browser storage via `localStorage`
- PWA-ready manifest and local app icon

Supabase is prepared structurally, but not active in V1.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Data Storage

The app stores each month separately in the browser:

```text
monthly-challenge:YYYY-MM
```

No account, database or environment variables are required for the local V1 prototype.

## Supabase Later

Next steps for the Supabase version:

- Install and configure the Supabase client
- Review `supabase-schema.sql`
- Add auth and RLS policies
- Replace the local repository with a Supabase-backed repository
