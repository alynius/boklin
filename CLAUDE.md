# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Boklin** is a Calendly-style booking system for Swedish freelancers and SMBs. The entire UI is in Swedish. Built with Next.js 15 (App Router), Tailwind CSS v4, and the "Nordic Linen" design system.

## Commands

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run typecheck    # TypeScript type checking
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database (development)
npm run db:studio    # Open Drizzle Studio
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: PostgreSQL via Neon + Drizzle ORM
- **Auth**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS v4 with design tokens
- **Validation**: Zod
- **Email**: Resend

## Architecture

### Route Structure (Swedish URLs)

```
src/app/
├── (auth)/                    # Auth pages (no layout chrome)
│   ├── logga-in/              # Sign in
│   └── registrera/            # Sign up
├── (dashboard)/               # Protected dashboard (shared layout)
│   ├── instrumentpanel/       # Dashboard home
│   ├── bokningar/             # Bookings list
│   ├── tillganglighet/        # Availability settings
│   ├── motestyper/            # Event types
│   └── installningar/         # Settings
├── (marketing)/               # Public marketing pages
│   ├── priser/                # Pricing
│   └── om-oss/                # About
├── [username]/                # Public booking pages
│   └── [eventSlug]/           # Specific event booking
└── api/
    ├── auth/[...nextauth]/    # NextAuth handlers
    └── webhooks/              # External webhooks
```

### Component Organization

```
src/components/
├── ui/           # Base UI components (Button, Input, Card, etc.)
├── booking/      # Booking flow components (CalendarGrid, TimeSlotPicker)
├── dashboard/    # Dashboard-specific components
└── layout/       # Shared layout components
```

### Key Files

- `src/lib/db/schema.ts` - Drizzle database schema
- `src/lib/auth/index.ts` - NextAuth configuration
- `src/lib/validations/` - Zod schemas
- `src/lib/i18n/sv.ts` - Swedish translations
- `src/types/index.ts` - TypeScript type definitions

## Design System (Nordic Linen)

Design tokens are in `design.tokens.nordic-linen.json` and applied via `src/app/globals.css`.

### Colors (use Tailwind classes)

| Token | Hex | Usage |
|-------|-----|-------|
| `canvas` | #E5E0D8 | Page background |
| `panel-dark` | #2A2A2A | Dark panels, headers |
| `panel-light` | #FCFAF7 | Cards, forms |
| `panel-slots` | #EFECE6 | Time slots panel |
| `accent` | #4A5D4E | Buttons, links, focus |
| `text-dark` | #2A2A2A | Primary text |
| `text-light` | #FCFAF7 | Text on dark bg |

### Typography

- **Sans**: Inter (body, headings)
- **Mono**: JetBrains Mono (labels, times, metadata)
- Use `.label-mono` class for uppercase tracking labels

### Transitions

Use `transition-smooth` class for the signature easing: `all 0.4s cubic-bezier(0.23, 1, 0.32, 1)`

## Database Schema

Core tables in `src/lib/db/schema.ts`:

- `users` - User accounts (extends NextAuth)
- `eventTypes` - Meeting types (duration, price, location)
- `availability` - Weekly availability slots
- `bookings` - Customer bookings
- `calendarConnections` - Google/Outlook calendar integrations

## SEO Requirements

Per `rules/SEO_RULES.md`:

- Use SSR/SSG for all indexable pages
- Every page needs: unique title (50-60 chars), meta description (140-160 chars), exactly one h1, canonical tag
- All images: descriptive alt, width/height attributes, lazy loading for below-fold
- Performance: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
DATABASE_URL          # Neon PostgreSQL connection string
AUTH_SECRET           # NextAuth secret (openssl rand -base64 32)
AUTH_URL              # NextAuth URL (http://localhost:3000 for dev)
GOOGLE_CLIENT_ID      # Google OAuth
GOOGLE_CLIENT_SECRET  # Google OAuth
NEXT_PUBLIC_APP_URL   # App URL (http://localhost:3000 for dev)
RESEND_API_KEY        # Email sending
EMAIL_FROM            # Sender email (e.g., "Boklin <noreply@boklin.se>")
```
