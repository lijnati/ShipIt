<div align="center">

<img src="brand/shipit-logo.png" alt="ShipIt" width="280" />

### Stop saying you're going to ship it.

Make a public promise. Set a deadline. Ship before the internet watches you fail.

[**Live site**](https://shipit.xylolabs.space) · [Explore promises](https://shipit.xylolabs.space/explore) · [Report a bug](https://github.com/lijnati/ShipIt/issues)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Postgres](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)

</div>

---

## What is ShipIt?

ShipIt is public accountability for makers. You write down one thing you'll ship and when. That promise gets a public page with a live countdown. When the clock hits zero, the page says **Shipped** or **Failed to ship**, permanently.

No roadmaps, no streaks, no moving the deadline.

```
 01  Make the promise   →  "I will ship my landing page by Friday."
 02  Share the page     →  shipit.xylolabs.space/c/ship-my-landing-page · 2d 14h remaining
 03  Ship it, or don't  →  SHIPPED  /  FAILED TO SHIP
```

## Features

| | |
|---|---|
| **Public promises** | Title, optional description, project link, and a hard deadline. Each promise gets a clean `/c/<slug>` URL. |
| **Live countdown** | Every challenge page and card counts down in real time, rendered in the viewer's timezone. |
| **Ship with proof** | Owners mark a promise shipped before the deadline, optionally attaching a proof link. |
| **Honest failure** | `FAILED` is never stored. It's derived from the deadline, so a missed promise can't be edited away. |
| **Reactions** | Signed-in visitors can react with 🔥 *ship it*, 🫡 *respect*, or 💀 *good luck*. |
| **Explore** | Browse recent or popular promises, filtered by Active, Shipped, or Failed. |
| **Profiles** | Every maker has a public ship log at `/u/<username>`. |
| **Share-ready** | Per-challenge Open Graph and X cards that reflect live state, plus one-click share to X. |
| **SEO basics** | Canonical URLs, `sitemap.xml`, `robots.txt`, and generated icons. |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Proxy) on React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4, shadcn/ui on Base UI, `lucide-react` icons |
| Auth | [Clerk](https://clerk.com) |
| Database | [Neon](https://neon.tech) serverless Postgres over the HTTP driver |
| ORM & migrations | [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit |
| Analytics | Vercel Analytics |
| Hosting | [Vercel](https://vercel.com) |
| Launch video | [Remotion](https://remotion.dev) (separate package in `video/`) |

## Getting started

### Prerequisites

- **Node.js** 20.9 or newer (24 LTS recommended)
- **pnpm** 11. The version is pinned in `package.json`, so run `corepack enable` and you'll get the right one.
- A **Clerk** application ([dashboard.clerk.com](https://dashboard.clerk.com))
- A **Neon** Postgres database ([console.neon.tech](https://console.neon.tech))

### 1. Install

```bash
git clone https://github.com/lijnati/ShipIt.git
cd ShipIt
pnpm install
```

### 2. Configure the environment

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|:---:|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (`pk_…`). Safe for the browser. |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (`sk_…`). Server-only. |
| `DATABASE_URL` | ✅ | Neon **pooled** connection string (`postgresql://…`). Server-only. |
| `NEXT_PUBLIC_APP_URL` | — | Absolute base URL for canonical links, OG images, and share links. Defaults to `http://localhost:3000` in development and `https://shipit.xylolabs.space` in production. |

The server checks these at startup (`lib/env.ts`, called from `instrumentation.ts`). If one is missing or malformed, it fails with a clear message that names the variable and never prints its value. In production it also warns if Clerk development keys are in use.

### 3. Set up the database

```bash
pnpm db:migrate
```

### 4. Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, pick a username, and make your first promise.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate a SQL migration from schema changes in `db/schema/` |
| `pnpm db:migrate` | Apply pending migrations to `DATABASE_URL` |
| `pnpm db:studio` | Open Drizzle Studio to browse the database |

## Project structure

```
.
├── app/                      # Routes (App Router)
│   ├── page.tsx              #   Landing page
│   ├── new/                  #   Create a promise (form + server action)
│   ├── c/[slug]/             #   Public challenge page, ship dialog, reactions, OG/X images
│   ├── u/[username]/         #   Public profile / ship log
│   ├── explore/              #   Browse recent & popular promises
│   ├── dashboard/            #   Your promises
│   ├── onboarding/           #   Choose a username
│   └── sign-in, sign-up/     #   Clerk auth pages
├── components/
│   ├── shipit/               # Product components (cards, hero, navbar, share, ship log…)
│   └── ui/                   # shadcn/ui primitives
├── db/
│   ├── schema/               # Drizzle tables: users, challenges, challenge_reactions
│   ├── queries/              # All data access, grouped by domain
│   └── index.ts              # Lazily created Neon HTTP client
├── drizzle/                  # Generated SQL migrations + snapshots
├── lib/                      # Domain logic: validation, challenge state, sharing, auth, env
├── brand/                    # Logo and mark assets
├── video/                    # Remotion launch video (standalone package)
├── proxy.ts                  # Clerk middleware (Next.js 16 "proxy")
└── instrumentation.ts        # Startup environment validation
```

## Architecture notes

A few decisions shape how the codebase works:

- **State is derived, not stored.** The database only knows `active` and `shipped`. `getChallengeState()` in `lib/challenge-status.ts` works out `ACTIVE`, `SHIPPED`, or `FAILED` from the deadline, and every surface uses that one function. No cron job flips rows, so there's nothing to drift.
- **Constraints live in the database too.** Validation in `lib/` is mirrored by Postgres `CHECK` constraints: title and description lengths, slug format, URL schemes, username format, and `shipped_at ⇔ status = 'shipped'`. Bad data can't get in, even around the app.
- **Identity comes from the session.** Server actions never trust IDs from the client. Ownership is resolved from the Clerk session through `getCurrentShipItUser()` and checked on the server, and non-owners get the same error whether or not a slug exists.
- **Auth checks live in pages.** `proxy.ts` only runs Clerk so `auth()` works everywhere. Protected pages call `requireShipItUser()` / `requireUsername()` directly, following Clerk's guidance against path-matching auth.
- **Idempotent reactions.** The client sends the desired on/off state, not a toggle, so replays and double-clicks can't flip a reaction back. A unique `(challenge, user, type)` constraint backs this up.
- **Serverless-friendly data access.** Neon's HTTP driver means one round trip per query and no connection pool to manage. The client is created on first use, so `next build` never needs database credentials.

### Data model

```
users ─────────────┐
  id, clerk_user_id│ 1
  username, …      │
                   │ n
challenges ────────┤
  id, user_id, slug│ 1
  title, deadline  │
  status, proof_url│ n
                   │
challenge_reactions┘
  challenge_id, user_id, type (fire | respect | skull)
```

Deleting a user cascades to their challenges and reactions.

## Deployment

ShipIt is built for [Vercel](https://vercel.com):

1. Import the repository into Vercel.
2. Add the environment variables above for the Production and Preview environments. Use Clerk **production** keys (`pk_live_` / `sk_live_`) in production.
3. Set `NEXT_PUBLIC_APP_URL` to your production domain.
4. Run `pnpm db:migrate` against the production database before or as part of the release.
5. Deploy.

## Launch video

`video/` is a standalone [Remotion](https://remotion.dev) project for the launch video on X. It shares the brand fonts and colors with the app.

```bash
cd video
pnpm install
pnpm studio    # interactive preview
pnpm render    # → out/shipit-launch.mp4
pnpm test      # unit tests (Vitest)
```

## Contributing

1. Branch from `master`.
2. Keep changes focused, and match the surrounding style.
3. If you change `db/schema/`, run `pnpm db:generate` and commit the migration it creates.
4. Run `pnpm lint` and `pnpm build` before opening a pull request.

> **Heads-up for AI coding agents:** this project uses Next.js 16, which has breaking changes from earlier versions (for example, `middleware.ts` is now `proxy.ts`). Read `AGENTS.md` and the docs in `node_modules/next/dist/docs/` before writing code.

## License

No license has been chosen yet, so all rights are reserved by default. Contact the maintainers before reusing this code.

<div align="center">
<br />
<sub>Free. Public by default. No moving the deadline.</sub>
</div>
