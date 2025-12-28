# Boklin Codebase Research Summary

## Overview

Boklin is a Next.js 15 booking system for Swedish freelancers and SMBs with a comprehensive design system ("Nordic Linen"), full authentication, and a complete booking workflow. The codebase is well-organized with clear patterns for authentication, database operations, forms, components, and routing.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication route group
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   ├── [username]/        # Public booking pages
│   ├── api/               # API routes
│   └── globals.css        # Design tokens & styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── booking/          # Booking flow components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities and configuration
│   ├── auth/            # NextAuth.js setup
│   ├── db/              # Database setup
│   ├── utils.ts         # Helper functions
│   ├── i18n/            # Swedish translations
│   └── validations/     # Zod validation schemas
├── types/               # TypeScript definitions
├── hooks/               # React hooks (empty)
├── actions/             # Server actions (empty)
└── middleware.ts        # Route protection
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: PostgreSQL + Neon + Drizzle ORM
- **Auth**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS v4 + custom design tokens
- **Validation**: Zod
- **Icons**: lucide-react
- **Fonts**: Inter (sans) + JetBrains Mono (mono)
- **Dates**: date-fns + date-fns-tz

## Key Patterns to Follow

### 1. Authentication (Always Use These)

**Server Components**:
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user) redirect("/logga-in");
```

**Client Components**:
```typescript
import { signIn, signOut } from "next-auth/react";
```

**Add Protected Route**:
1. Add path to `protectedPaths` in `/middleware.ts`
2. Add auth check in layout/page
3. Use route group: `(dashboard)/path/`

### 2. Forms & Validation

All forms use:
1. **Zod schema** in `/lib/validations/`
2. **Input component** from `/components/ui/`
3. **FormData API** for form submission
4. **Swedish error messages**

Example validation file structure:
```typescript
// /lib/validations/schema.ts
export const mySchema = z.object({/* ... */});
export type MyData = z.infer<typeof mySchema>;
```

### 3. Database Patterns

- All tables use UUID primary keys
- All tables have `createdAt` and `updatedAt` timestamps
- Foreign keys use `references()` with `onDelete: "cascade"`
- Relations defined separately at bottom of schema file
- Queries use Drizzle ORM with `eq()` for WHERE clauses

### 4. Component Architecture

**Structure**:
- Files: `kebab-case.tsx` (e.g., `booking-form.tsx`)
- Exports: `PascalCase` (e.g., `BookingForm`)
- Props interface: `ComponentNameProps`
- Use `forwardRef` for form inputs

**Base Components**:
- `Button` - variants: primary, secondary, ghost, danger
- `Input` - with label, error, hint support
- `Card` - variants: light, dark, slots
- `LabelMono` - uppercase monospace labels
- All re-exported from `/components/ui/index.ts`

### 5. Styling with Design Tokens

**Color System** (use Tailwind classes):
- `bg-canvas` - page background
- `bg-panel-light` - cards/forms
- `bg-panel-dark` - headers
- `bg-panel-slots` - time picker
- `text-text-dark` - primary text
- `text-accent` - interactive elements
- `text-error/success/warning` - status colors

**Utilities**:
- `transition-smooth` - consistent 0.4s easing
- `label-mono` - uppercase tracking labels
- `cn()` from `/lib/utils` - conditional classes

### 6. Routing Organization

**Route Groups** (URL-transparent):
- `(auth)` - Sign in, register
- `(dashboard)` - Protected pages
- `(marketing)` - Public info pages

**Dynamic Routes**:
- `[username]` - User's public profile
- `[eventSlug]` - Specific event booking

**Pattern for params**:
```typescript
interface Props {
  params: Promise<{ username: string }>;
}
export default async function Page({ params }: Props) {
  const { username } = await params;
}
```

### 7. State Management

- **Server Components**: Use `auth()`, `db` queries directly
- **Client Components**: Use `useState` for local state
- **Multi-step**: Lift state to parent, use type union for steps
- **No global state library** currently (Context not needed yet)

### 8. Utilities to Reuse

```typescript
// All in /lib/utils.ts
cn()                    // Merge Tailwind classes
formatDate()            // Swedish date format
formatTime()            // 24h time format
formatDuration()        // Human-readable duration
slugify()              // URL-safe slug (handles åäö)
getInitials()          // Name initials
safeJsonParse()        // JSON with fallback
```

## Files That Should NOT Be Modified

These are "stable" files that define the project structure:
- `/src/middleware.ts` - Only add/remove protected paths
- `/src/lib/auth/index.ts` - Only modify if changing auth logic
- `/src/lib/db/index.ts` - Only modify if changing DB config
- `/src/app/globals.css` - Only add utilities, don't change tokens
- `/src/app/layout.tsx` - Root layout, minimal changes

## Common Implementation Patterns

### Adding a Protected Dashboard Page

```
1. Create route: src/app/(dashboard)/new-page/
2. Create page.tsx with metadata and auth check
3. Create components in src/components/dashboard/ if needed
4. Add navigation link to sv.ts and nav.tsx
5. Add to middleware.ts protectedPaths if needed
```

### Creating a Form

```
1. Create Zod schema in src/lib/validations/
2. Create form component using Input components
3. Handle FormData in onSubmit
4. Use validated data in server action or API call
5. Show errors via Input error prop
```

### Adding a New UI Component

```
1. Create in src/components/ui/component-name.tsx
2. Export from src/components/ui/index.ts
3. Use cn() for conditional classes
4. Support composition (Header, Content, Footer sub-components)
5. Extend native HTML element props
```

## Translation Keys

All Swedish text should use the `sv` object from `/lib/i18n/sv.ts`:
- `sv.common.*` - Save, cancel, delete, etc.
- `sv.nav.*` - Navigation labels
- `sv.auth.*` - Sign in/up text
- `sv.booking.*` - Booking flow text
- `sv.eventType.*` - Event type management
- `sv.availability.*` - Availability settings
- `sv.errors.*` - Error messages
- `sv.status.*` - Booking statuses

## Design System (Nordic Linen)

- **Colors**: Warm, neutral palette (canvas #E5E0D8, accent #4A5D4E)
- **Typography**: Inter (sans) for body, JetBrains Mono for metadata
- **Spacing**: 8px grid system
- **Transitions**: 0.4s cubic-bezier(0.23, 1, 0.32, 1)
- **Borders**: Subtle, low contrast
- **Shadows**: Soft, layered depth

## Current Limitations

1. **No real database operations** - Booking pages use mock data
2. **No server actions** - `/src/actions/` directory empty
3. **No API endpoints** - Only auth endpoint implemented
4. **No calendar sync** - Calendar connection types defined but not implemented
5. **No email sending** - Resend package installed but unused

## Next Steps When Adding Features

Always follow this checklist:

- [ ] Add Zod schema if handling user input
- [ ] Update types in `/types/index.ts` if creating new entities
- [ ] Add database operations if persisting data
- [ ] Create UI components using base components
- [ ] Add Swedish translations to `sv.ts`
- [ ] Add page metadata for SEO
- [ ] Use route groups for logical organization
- [ ] Check auth requirements and add to middleware if needed
- [ ] Use existing components (Button, Input, Card)
- [ ] Apply design tokens (colors, transitions)
- [ ] Test responsive design (mobile-first)
- [ ] Use `cn()` for conditional classes
- [ ] Import types from `@/types`

## Documentation Files

Two documentation files have been created:

1. **`PATTERNS_AND_UTILITIES.md`** (1244 lines)
   - Comprehensive guide to all patterns
   - Full code examples
   - Detailed explanations
   - Use this for in-depth understanding

2. **`PATTERNS_QUICK_REFERENCE.md`** (220 lines)
   - Quick lookup guide
   - Code snippets without explanation
   - Common mistakes to avoid
   - File locations
   - Use this during development

## Key Insights

1. **Well-organized structure** - Clear separation of concerns (auth, db, ui, validations)
2. **Swedish-first** - All UI text, dates, and validation in Swedish
3. **Type-safe** - Full TypeScript support with Zod validation
4. **Design-consistent** - Nordic Linen design system applied throughout
5. **Scalable patterns** - Room to grow without major refactoring
6. **Server-component focused** - Leverages Next.js 15 App Router capabilities
7. **Component reusability** - Composable UI system (Card, Button, Input)
8. **Middleware-based security** - Centralized route protection

## Recommended Reading Order

1. Read this `RESEARCH_SUMMARY.md` first (overview)
2. Check `PATTERNS_QUICK_REFERENCE.md` when coding
3. Refer to `PATTERNS_AND_UTILITIES.md` for detailed patterns
4. Look at existing components/pages as examples
5. Check `/CLAUDE.md` for project-specific instructions

