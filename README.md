# SimpleBooks AI (Daily Book AI)

A simple daily bookkeeping app for small business owners: log money in and out,
see today's and this month's totals, ask an AI helper questions about your
spending, and export your records for your accountant.

## Stack

- TanStack Start, TypeScript, React, Tailwind CSS
- Supabase (auth, Postgres database, storage) — your own project
- Claude (Anthropic API) for the AI chat and receipt photo auto-fill
- Hosted on Cloudflare Workers, deployed automatically on every push to `main`

## Development

```sh
npm i
npm run dev
```

You'll need a `.env` file with your Supabase project's URL and publishable key
(see `.env` in this repo, or Supabase's dashboard under Settings -> API).
