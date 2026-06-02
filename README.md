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

Supabase support is wired in, but the app still works as a guest app when env vars are missing.

Required local env file:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Setup steps:

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. Enable Email OTP / Magic Link auth.
4. Add redirect URLs:
   - `http://localhost:3000`
   - your Vercel production URL
   - your Vercel preview URL pattern if needed
5. Add the same env vars in Vercel.

When signed in, challenges are stored in Supabase. Without a session, the app keeps using local browser storage.

## Deployment

GitHub repository:

```text
https://github.com/wtcologne/dotted_days
```

Vercel CLI check:

```bash
npx vercel whoami
```

If not authenticated:

```bash
npx vercel login
```

Then connect the GitHub repository in Vercel and deploy with the default Next.js settings.
