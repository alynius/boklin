# Boklin

A modern, Calendly-style booking system built for Swedish freelancers and SMBs. Features a beautiful Nordic-inspired design, complete booking management, and seamless calendar integration.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)

## Features

### For Hosts (Freelancers/Businesses)
- **Event Types** - Create multiple meeting types with custom durations, prices, and locations
- **Availability Management** - Set weekly schedules with multiple time ranges per day
- **Booking Dashboard** - View, confirm, and manage all bookings in one place
- **Google Calendar Sync** - Two-way sync with Google Calendar for conflict-free scheduling
- **Email Notifications** - Automatic confirmations, notifications, and cancellation emails
- **Custom Booking Links** - Shareable links like `boklin.se/username/meeting-type`

### For Guests (Customers)
- **Easy Booking Flow** - Simple 3-step process: select date → select time → enter details
- **Real-time Availability** - See only available time slots
- **Instant Confirmation** - Receive email confirmation with calendar invite
- **Self-service Cancellation** - Cancel bookings via email link

### Technical Highlights
- **Server-Side Rendering** - SEO-optimized with Next.js App Router
- **Type-Safe** - Full TypeScript with Zod validation
- **Swedish Localization** - Complete Swedish UI and date formatting
- **Nordic Linen Design** - Beautiful, warm design system with linen textures

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Authentication | NextAuth.js v5 (Google OAuth) |
| Styling | Tailwind CSS v4 |
| Email | Resend + React Email |
| Calendar | Google Calendar API |
| Validation | Zod |
| Icons | Lucide React |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Google OAuth credentials
- Resend API key (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/alynius/boklin.git
cd boklin

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your credentials
nano .env.local

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Create a `.env.local` file with:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth.js
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="Boklin <noreply@yourdomain.com>"
```

### Getting Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
5. For calendar sync, enable Google Calendar API

**Neon Database:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy the connection string

**Resend:**
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (sign in, register)
│   │   ├── logga-in/
│   │   └── registrera/
│   ├── (dashboard)/              # Protected dashboard
│   │   ├── instrumentpanel/      # Dashboard home
│   │   ├── bokningar/            # Bookings list
│   │   ├── motestyper/           # Event types CRUD
│   │   ├── tillganglighet/       # Availability settings
│   │   └── installningar/        # User settings
│   ├── (marketing)/              # Public marketing pages
│   │   ├── priser/               # Pricing
│   │   └── om-oss/               # About
│   ├── [username]/               # Public booking pages
│   │   └── [eventSlug]/
│   └── api/
│       ├── auth/                 # NextAuth handlers
│       └── calendar/             # Google Calendar OAuth
├── components/
│   ├── ui/                       # Base UI components
│   ├── booking/                  # Booking flow components
│   ├── dashboard/                # Dashboard components
│   ├── forms/                    # Form components
│   └── settings/                 # Settings components
├── lib/
│   ├── actions/                  # Server Actions
│   ├── auth/                     # NextAuth config
│   ├── availability/             # Slot calculation
│   ├── calendar/                 # Google Calendar helpers
│   ├── db/                       # Database & queries
│   ├── email/                    # Email templates
│   ├── i18n/                     # Swedish translations
│   ├── utils.ts                  # Utility functions
│   └── validations/              # Zod schemas
└── types/                        # TypeScript types
```

## Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # TypeScript type checking
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Database Schema

```
┌─────────────────┐     ┌─────────────────┐
│     users       │────<│   eventTypes    │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ email           │     │ userId          │
│ name            │     │ title           │
│ username        │     │ slug            │
│ timezone        │     │ duration        │
│ image           │     │ price           │
└─────────────────┘     │ location        │
        │               │ isActive        │
        │               └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  availability   │     │    bookings     │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ userId          │     │ eventTypeId     │
│ dayOfWeek       │     │ userId          │
│ startTime       │     │ guestName       │
│ endTime         │     │ guestEmail      │
└─────────────────┘     │ startTime       │
                        │ status          │
                        │ calendarEventId │
                        └─────────────────┘

┌─────────────────┐
│calendarConnections│
├─────────────────┤
│ id              │
│ userId          │
│ provider        │
│ accessToken     │
│ refreshToken    │
│ expiresAt       │
└─────────────────┘
```

## Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/logga-in` | Sign in | Public |
| `/registrera` | Sign up | Public |
| `/priser` | Pricing page | Public |
| `/om-oss` | About page | Public |
| `/instrumentpanel` | Dashboard home | Protected |
| `/bokningar` | Manage bookings | Protected |
| `/motestyper` | Manage event types | Protected |
| `/motestyper/ny` | Create event type | Protected |
| `/motestyper/[id]` | Edit event type | Protected |
| `/tillganglighet` | Set availability | Protected |
| `/installningar` | User settings | Protected |
| `/[username]` | Public profile | Public |
| `/[username]/[slug]` | Book event | Public |

## Design System (Nordic Linen)

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `canvas` | #E5E0D8 | Page background |
| `panel-dark` | #2A2A2A | Dark panels, headers |
| `panel-light` | #FCFAF7 | Cards, forms |
| `panel-slots` | #EFECE6 | Time slots panel |
| `accent` | #4A5D4E | Buttons, links, focus |
| `text-dark` | #2A2A2A | Primary text |
| `text-light` | #FCFAF7 | Text on dark backgrounds |

### Typography

- **Sans**: Inter (body, headings)
- **Mono**: JetBrains Mono (labels, times, metadata)

### Utilities

```css
.transition-smooth  /* 0.4s cubic-bezier easing */
.label-mono         /* Uppercase, tracked, monospace */
```

## API Reference

### Server Actions

```typescript
// Bookings
createBookingAction(formData: FormData)
cancelBookingAction(id: string, reason?: string)
confirmBookingAction(id: string)

// Event Types
createEventTypeAction(formData: FormData)
updateEventTypeAction(id: string, formData: FormData)
deleteEventTypeAction(id: string)
toggleEventTypeActiveAction(id: string)

// Availability
updateAvailabilityAction(formData: FormData)

// Users
updateProfileAction(formData: FormData)
updateTimezoneAction(timezone: string)

// Calendar
disconnectCalendarAction()
getAvailableSlotsAction(userId: string, eventTypeId: string, date: string)
```

### Database Queries

```typescript
// Users
getUserById(id: string)
getUserByUsername(username: string)
getUserStats(userId: string)

// Event Types
getEventTypesByUserId(userId: string)
getEventTypeBySlug(userId: string, slug: string)
getPublicEventTypes(username: string)

// Availability
getAvailabilityByUserId(userId: string)
getAvailableSlots(userId: string, eventTypeId: string, date: Date)

// Bookings
getBookingsByUserId(userId: string, filters?)
getUpcomingBookings(userId: string, limit?)
createBooking(data: BookingInput)
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

```bash
# Build
npm run build

# Start
npm run start
```

Ensure you have:
- Node.js 18+ runtime
- Environment variables configured
- Database accessible from deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with [Next.js](https://nextjs.org) and [Claude Code](https://claude.ai/code)
