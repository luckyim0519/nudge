# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
```

## Environment Setup

Copy `.env.local.example` → `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the SQL in `supabase/migrations/001_initial.sql` in your Supabase SQL editor, then `supabase/seed.sql` for community data. Create a public storage bucket named `post-photos` in Supabase Storage.

## Architecture

**Nudge** is a mobile-first Next.js 14 App Router app — a private study diary for friend groups with a public community browsing feature.

### Route Groups
- `app/(auth)/` — Login, signup, onboarding (create/join group). No bottom nav.
- `app/(app)/` — Protected routes with bottom nav: feed, calendar, community, profile.
- `app/auth/callback/` — OAuth callback handler.

### Auth Flow
Middleware (`middleware.ts`) guards all non-auth routes. After signup, users must complete onboarding to create or join a group via invite code. Each user belongs to exactly one group. After Google OAuth, `app/auth/callback/route.ts` handles profile creation and group redirect.

### Data Pattern
Pages are **server components** that fetch initial data via `lib/supabase/server.ts`, then pass it to `*Client.tsx` **client components** for interactivity (reactions, post form, calendar day selection). The client components call `lib/supabase/client.ts` for mutations and live refreshes.

### Key Files
- `lib/types.ts` — All shared TypeScript interfaces + `EMOJIS` constant + `MEMBER_COLORS` array
- `lib/supabase/client.ts` — Browser Supabase client (`@supabase/ssr`)
- `lib/supabase/server.ts` — Server Supabase client (uses `next/headers` cookies)
- `components/ui/Avatar.tsx` — Initials-based avatar with member color
- `components/feed/PostCard.tsx` — Post with emoji reaction toggle (optimistic UI)
- `components/feed/PostForm.tsx` — Text + photo upload form at bottom of feed

### Design Tokens (Tailwind)
- `bg-cream` (#FAF7F2) — page background
- `text-dark` / `bg-dark` (#2C2318) — primary text/button
- `bg-amber` / `text-amber` (#F5A623) — accent, active nav, reactions
- `bg-sand` (#E8E0D4) — borders, input backgrounds, tabs
- `text-spark` (#C9503A) — errors, Sunday dates
- `font-display` class → DM Serif Display (headings)
- `font-sans` → DM Sans (body, default)

### Community Posts
Community content is **mock data only** (defined directly in `app/(app)/community/[slug]/page.tsx`). No write path exists for community — it's read-only browsing.

### Member Colors
Each group member gets a color from `MEMBER_COLORS` in `lib/types.ts` assigned at join time. Colors appear on avatars and as calendar dots.
