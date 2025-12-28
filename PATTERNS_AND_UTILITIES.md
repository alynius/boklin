# Boklin Codebase Patterns & Utilities Guide

Comprehensive documentation of patterns and reusable utilities for implementing new features in Boklin.

## 1. Authentication Patterns

### 1.1 Getting the Current Session in Server Components

**Pattern**: Use the `auth()` function imported from `@/lib/auth`

```typescript
// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/logga-in");
  }

  return (
    <div>
      <span>{session.user.email}</span>
      <div>{session.user.name?.[0]?.toUpperCase()}</div>
    </div>
  );
}
```

**Key Points**:
- Always await `auth()` in server components
- Check `session?.user` before accessing user data
- Session object includes `id`, `name`, `email`, `image` properties
- Returns `null` if not authenticated

**Files**:
- `/home/youhad/boklin/src/lib/auth/index.ts` - Auth configuration
- `/home/youhad/boklin/src/middleware.ts` - Session-based routing

### 1.2 Protected Routes Pattern

**Pattern**: Use middleware redirect + server component auth check

**Middleware** (`/home/youhad/boklin/src/middleware.ts`):
```typescript
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const protectedPaths = ["/instrumentpanel", "/bokningar", "/tillganglighet"];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath && !isLoggedIn) {
    const signInUrl = new URL("/logga-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
});
```

**Then in layout/page**:
```typescript
const session = await auth();
if (!session?.user) {
  redirect("/logga-in");
}
```

**Add Protected Path**:
1. Add to `protectedPaths` array in middleware
2. Add auth check in the layout or page component
3. Add route group structure: `(dashboard)/[route]/page.tsx`

### 1.3 Client-Side Auth (signIn/signOut)

**Pattern**: Use NextAuth.js hooks in "use client" components

```typescript
// src/app/(auth)/logga-in/sign-in-form.tsx
"use client";
import { signIn } from "next-auth/react";

export function SignInForm() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/instrumentpanel" });
  };

  return <Button onClick={handleGoogleSignIn}>Logga in med Google</Button>;
}
```

**Sign Out**:
```typescript
"use client";
import { signOut } from "next-auth/react";

<button onClick={() => signOut({ callbackUrl: "/" })}>
  Logga ut
</button>
```

### 1.4 Session Type Augmentation

NextAuth session type is extended in `/home/youhad/boklin/src/lib/auth/index.ts`:
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
```

---

## 2. Data Fetching Patterns

### 2.1 Server Component Database Queries

**Pattern**: Use Drizzle ORM with the `db` instance

**Example** (`/home/youhad/boklin/src/app/[username]/[eventSlug]/page.tsx`):
```typescript
// This is the pattern to follow:
async function getEventType(username: string, eventSlug: string) {
  // TODO: Replace with actual database query
  // const eventType = await db
  //   .select()
  //   .from(eventTypes)
  //   .where(eq(eventTypes.slug, eventSlug))
  //   .limit(1);
  
  return mockData; // For now
}

export default async function EventBookingPage({ params }: Props) {
  const { username, eventSlug } = await params;
  const eventType = await getEventType(username, eventSlug);
  
  if (!eventType) {
    notFound();
  }
  
  return <div>{/* render */}</div>;
}
```

### 2.2 Database Instance

**File**: `/home/youhad/boklin/src/lib/db/index.ts`

```typescript
import { db } from "@/lib/db";
import { eventTypes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Query pattern
const result = await db
  .select()
  .from(eventTypes)
  .where(eq(eventTypes.userId, userId));
```

**Available Tables** (from `/home/youhad/boklin/src/lib/db/schema.ts`):
- `users` - User accounts (id, email, username, timezone)
- `eventTypes` - Meeting types (title, slug, duration, price)
- `availability` - Weekly availability (dayOfWeek, startTime, endTime)
- `bookings` - Customer bookings (guestName, guestEmail, startTime, status)
- `calendarConnections` - Calendar integrations (provider, accessToken)

### 2.3 Server Actions Pattern

**Note**: No server actions directory currently exists. When implementing, follow this pattern:

```typescript
// src/actions/booking.ts (when needed)
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function createBooking(data: BookingFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  // Database operation
  const result = await db.insert(bookings).values({
    userId: session.user.id,
    ...data,
  }).returning();
  
  return result;
}
```

**In Client Component**:
```typescript
"use client";
import { createBooking } from "@/actions/booking";

async function handleSubmit(data) {
  await createBooking(data);
}
```

---

## 3. Form Patterns

### 3.1 Validation Schemas

**File**: `/home/youhad/boklin/src/lib/validations/booking.ts`

**Pattern**: Use Zod for client and server validation

```typescript
import { z } from "zod";

export const bookingFormSchema = z.object({
  name: z
    .string()
    .min(2, "Namnet måste vara minst 2 tecken")
    .max(100, "Namnet får inte vara längre än 100 tecken"),
  email: z
    .string()
    .email("Ange en giltig e-postadress"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s-]{6,20}$/.test(val),
      "Ange ett giltigt telefonnummer"
    ),
  notes: z
    .string()
    .max(500, "Anteckningar får inte vara längre än 500 tecken")
    .optional(),
  startTime: z.coerce.date(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
```

**Existing Schemas**:
- `bookingFormSchema` - Guest booking form validation
- `eventTypeSchema` - Event type creation/editing
- `availabilitySchema` - Availability slot validation

### 3.2 Form Components Pattern

**File**: `/home/youhad/boklin/src/components/booking/booking-form.tsx`

```typescript
"use client";

interface BookingFormProps {
  eventType: EventType;
  selectedDate: Date;
  selectedTime: Date;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onBack: () => void;
}

export function BookingForm({
  eventType,
  selectedDate,
  selectedTime,
  onSubmit,
  onBack,
}: BookingFormProps) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await onSubmit({
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string || undefined,
          notes: formData.get("notes") as string || undefined,
        });
      }}
      className="space-y-4"
    >
      <Input
        label="Namn"
        name="name"
        placeholder="Ditt fullständiga namn"
        required
      />
      <Input
        label="E-post"
        name="email"
        type="email"
        placeholder="din@epost.se"
        required
      />
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onBack}>
          Tillbaka
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Bekräfta
        </Button>
      </div>
    </form>
  );
}
```

### 3.3 Form Error Display

**Pattern**: Use `error` and `hint` props on Input component

```typescript
import { Input } from "@/components/ui";

// With error state
<Input
  label="E-post"
  name="email"
  error={errors.email ? "Ange en giltig e-postadress" : undefined}
  type="email"
/>

// With hint
<Input
  label="Användarnamn"
  name="username"
  hint="Detta syns i din bokningslänk"
/>
```

**Input Component Features** (`/home/youhad/boklin/src/components/ui/input.tsx`):
- Automatic error styling (red border, error message)
- aria-invalid and aria-describedby for accessibility
- Optional label and hint text
- Integrated error/hint display

---

## 4. Component Patterns

### 4.1 UI Component Structure

**Pattern**: Use `forwardRef` for form components, compose with `cn()` utility

**Button Component** (`/home/youhad/boklin/src/components/ui/button.tsx`):
```typescript
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-smooth ...";
    const variants = {
      primary: "bg-accent hover:bg-accent-hover text-text-light",
      secondary: "bg-panel-light hover:bg-hover-day text-text-dark",
      ghost: "hover:bg-hover-day text-text-dark",
      danger: "bg-error hover:bg-error/90 text-text-light",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded",
      md: "px-5 py-2.5 text-sm rounded-md",
      lg: "px-8 py-4 text-base rounded-md tracking-widest",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <>Loading spinner...</> : children}
      </button>
    );
  }
);
```

### 4.2 Card Component Pattern

**File**: `/home/youhad/boklin/src/components/ui/card.tsx`

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "slots";
}

export function Card({
  className,
  variant = "light",
  children,
  ...props
}: CardProps) {
  const variants = {
    light: "bg-panel-light text-text-dark",
    dark: "bg-panel-dark text-text-light",
    slots: "bg-panel-slots text-text-dark",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle shadow-card p-6",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Composed sub-components
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-bold tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex items-center gap-4", className)} {...props} />;
}
```

### 4.3 Using cn() Utility

**File**: `/home/youhad/boklin/src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage in Components**:
```typescript
// Conditionally apply classes
className={cn(
  "base-classes",
  variant === "primary" && "primary-styles",
  variant === "secondary" && "secondary-styles",
  isActive && "active-styles",
  customClassName
)}

// Merge conflicting Tailwind classes
className={cn(
  "px-4 py-2",      // Base padding
  "px-6"            // Override padding - twMerge handles it
)}
```

### 4.4 LabelMono Component

**File**: `/home/youhad/boklin/src/components/ui/label-mono.tsx`

```typescript
interface LabelMonoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
}

export function LabelMono({
  className,
  size = "md",
  children,
  ...props
}: LabelMonoProps) {
  const sizes = {
    sm: "text-[0.7rem]",
    md: "text-[0.75rem]",
  };

  return (
    <span
      className={cn(
        "font-mono uppercase tracking-[0.1em] opacity-60",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
```

**Usage**:
```typescript
<LabelMono>Bokningsdetaljer</LabelMono>
<h2 className="text-xl font-bold text-text-dark mt-2">Titel</h2>
```

### 4.5 Component Naming Conventions

- **File**: `lowercase-with-dashes.tsx` (e.g., `booking-form.tsx`)
- **Export**: `PascalCase` (e.g., `export function BookingForm`)
- **Props Interface**: `ComponentNameProps` (e.g., `BookingFormProps`)
- **Index files**: Re-export components from `index.ts` in the directory

Example (`/home/youhad/boklin/src/components/ui/index.ts`):
```typescript
export { Button } from "./button";
export type { ButtonProps } from "./button";
export { Input } from "./input";
export { Card, CardHeader, CardTitle, CardContent } from "./card";
```

---

## 5. Routing Patterns

### 5.1 Route Groups

**Pattern**: Use parentheses for route organization without URL slug

```
src/app/
├── (auth)/              # Auth route group (no URL prefix)
│   ├── logga-in/
│   ├── registrera/
│   └── layout.tsx       # Auth-specific layout
├── (dashboard)/         # Protected dashboard
│   ├── instrumentpanel/
│   ├── bokningar/
│   ├── layout.tsx       # Dashboard layout with auth check
│   └── ...
├── (marketing)/         # Marketing pages
│   ├── priser/
│   └── om-oss/
└── [username]/          # Dynamic public routes
    └── [eventSlug]/
```

### 5.2 Auth Route Group

**File**: `/home/youhad/boklin/src/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="py-6 px-6">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          Boklin
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
```

### 5.3 Dashboard Route Group

**File**: `/home/youhad/boklin/src/app/(dashboard)/layout.tsx`

```typescript
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/logga-in");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-panel-dark text-text-light">
        {/* Header content */}
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <DashboardNav />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

### 5.4 Dynamic Routes

**Pattern**: Use `params` as Promise in Next.js 15 with App Router

```typescript
interface Props {
  params: Promise<{ username: string; eventSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, eventSlug } = await params;
  const eventType = await getEventType(username, eventSlug);

  return {
    title: `${eventType.title} - ${eventType.user.name}`,
    description: eventType.description,
  };
}

export default async function EventBookingPage({ params }: Props) {
  const { username, eventSlug } = await params;
  const eventType = await getEventType(username, eventSlug);

  if (!eventType) {
    notFound();
  }

  return <BookingWidget eventType={eventType} />;
}
```

### 5.5 Navigation Patterns

**Server-side**:
```typescript
import { redirect } from "next/navigation";

// After successful action
redirect("/instrumentpanel");
```

**Client-side**:
```typescript
import Link from "next/link";

<Link href="/bokningar">Bokningar</Link>
```

**Current Page Detection** (for nav highlighting):
```typescript
"use client";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();
  const isActive = pathname === "/instrumentpanel";
  
  return (
    <Link
      href="/instrumentpanel"
      className={cn(isActive ? "bg-accent text-text-light" : "text-text-dark")}
    >
      Instrumentpanel
    </Link>
  );
}
```

---

## 6. Styling Patterns

### 6.1 Design Token Colors

**File**: `/home/youhad/boklin/src/app/globals.css`

**Available CSS Custom Properties**:
```css
--color-canvas: #E5E0D8;              /* Page background */
--color-panel-dark: #2A2A2A;          /* Dark panels, headers */
--color-panel-light: #FCFAF7;         /* Cards, forms */
--color-panel-slots: #EFECE6;         /* Time slots panel */
--color-text-dark: #2A2A2A;           /* Primary text */
--color-text-light: #FCFAF7;          /* Text on dark bg */
--color-accent: #4A5D4E;              /* Buttons, links, focus */
--color-accent-hover: #3E4E41;        /* Accent hover state */
--color-hover-day: #F0EDE8;           /* Calendar day hover */
--color-border-subtle: rgba(0, 0, 0, 0.05);
--color-slot-bg: rgba(255, 255, 255, 0.5);
--color-slot-bg-hover: #FFFFFF;
--color-error: #B91C1C;
--color-success: #15803D;
--color-warning: #CA8A04;
```

**In Tailwind Classes**:
```typescript
// Use Tailwind naming convention
className="bg-canvas text-text-dark"
className="bg-panel-light hover:bg-hover-day"
className="text-accent"
className="border-border-subtle"
className="bg-error text-error"
```

### 6.2 Transition Utility

**Pattern**: Use `transition-smooth` class for consistent animation

**CSS** (`/home/youhad/boklin/src/app/globals.css`):
```css
.transition-smooth {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
```

**Usage**:
```typescript
className="transition-smooth hover:bg-accent"
className="transition-smooth focus:ring-2"
```

### 6.3 Typography

**Fonts** (`/home/youhad/boklin/src/app/layout.tsx`):
```typescript
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

// In body
className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}
```

**Sans (Inter)**: Used for body text and headings
**Mono (JetBrains Mono)**: Used for labels, times, metadata

### 6.4 Common Tailwind Patterns

**Containers**:
```typescript
// Full width container with max-width
className="mx-auto max-w-7xl px-6"

// Flexible layouts
className="flex items-center justify-between gap-4"
className="grid md:grid-cols-2 gap-6"
className="flex-1 min-w-0"  // Prevent text overflow in flex
```

**Spacing**:
```typescript
className="space-y-4"   // Vertical spacing between children
className="gap-6"      // Flex/grid gap
className="px-6 py-8"  // Padding
className="mb-4 mt-2"  // Margin
```

**Colors**:
```typescript
className="text-text-dark"
className="text-text-dark/60"  // With opacity
className="bg-panel-light"
className="border border-border-subtle"
```

### 6.5 Label Mono Utility Class

**Pattern**: Use for uppercase, tracking labels

```typescript
// As component
<LabelMono size="sm">Bokningsdetaljer</LabelMono>

// As CSS class
className="label-mono"  // text-transform: uppercase, letter-spacing: 0.1em
```

---

## 7. Reusable Utilities

### 7.1 Utils Module

**File**: `/home/youhad/boklin/src/lib/utils.ts`

**Available Functions**:

```typescript
// Class name merging (for Tailwind)
import { cn } from "@/lib/utils";
className={cn("base", condition && "conditional")}

// Date formatting (Swedish locale)
import { formatDate, formatTime, formatDuration } from "@/lib/utils";

formatDate(new Date())                     // "28 december 2025"
formatTime(new Date())                     // "14:30"
formatDuration(90)                         // "1 timme 30 min"

// URL-safe slug generation (handles Swedish chars)
import { slugify } from "@/lib/utils";
slugify("Min Mötestyp")                    // "min-moetstyp"
slugify("Video samtal äöå")                // "video-samtal-aoa"

// Generate initials from name
import { getInitials } from "@/lib/utils";
getInitials("Anna Andersson")              // "AA"

// Safe JSON parsing with fallback
import { safeJsonParse } from "@/lib/utils";
const data = safeJsonParse(jsonString, {}) // Returns fallback if invalid
```

### 7.2 Swedish Translations

**File**: `/home/youhad/boklin/src/lib/i18n/sv.ts`

```typescript
import { sv } from "@/lib/i18n/sv";

// Structure: sv.section.key
sv.common.save              // "Spara"
sv.common.loading           // "Laddar..."
sv.nav.dashboard            // "Instrumentpanel"
sv.auth.signInTitle         // "Logga in på Boklin"
sv.booking.selectDate       // "Välj datum"
sv.eventType.title          // "Mötestyper"
sv.availability.setHours    // "Ställ in dina arbetstider"
sv.errors.generic           // "Något gick fel. Försök igen."
sv.status.confirmed         // "Bekräftad"
```

**Usage Pattern**:
```typescript
import { sv } from "@/lib/i18n/sv";

<h1>{sv.booking.selectDate}</h1>
<Button>{sv.common.save}</Button>
<p>{sv.errors.validation}</p>
```

### 7.3 Type Definitions

**File**: `/home/youhad/boklin/src/types/index.ts`

```typescript
// Core interfaces
export interface User { /* ... */ }
export interface EventType { /* ... */ }
export interface Booking { /* ... */ }
export interface Availability { /* ... */ }
export interface TimeSlot { /* ... */ }
export interface CalendarConnection { /* ... */ }

// Type aliases
export type EventLocationType = "in_person" | "phone" | "video" | "custom";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type CalendarProvider = "google" | "outlook";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Constants
export const DAY_NAMES_SV: Record<DayOfWeek, string> = {
  0: "Söndag",
  1: "Måndag",
  // ...
};

export const DAY_NAMES_SHORT_SV: Record<DayOfWeek, string> = {
  0: "Sön",
  1: "Mån",
  // ...
};

// Generic response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### 7.4 Database Schema Patterns

**File**: `/home/youhad/boklin/src/lib/db/schema.ts`

**Pattern for Timestamps**:
```typescript
createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
```

**Pattern for User References**:
```typescript
userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),
```

**Pattern for JSON Columns**:
```typescript
location: json("location").$type<{
  type: "in_person" | "phone" | "video" | "custom";
  address?: string;
  link?: string;
}>(),
```

**Pattern for Enums**:
```typescript
status: varchar("status", { length: 20 })
  .$type<"pending" | "confirmed" | "cancelled">()
  .default("pending")
  .notNull(),
```

**Relations Pattern**:
```typescript
export const eventTypesRelations = relations(eventTypes, ({ one, many }) => ({
  user: one(users, {
    fields: [eventTypes.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));
```

### 7.5 Validation Schemas Pattern

**File**: `/home/youhad/boklin/src/lib/validations/booking.ts`

**Core Patterns**:
```typescript
// String validation
z.string()
  .min(2, "Minsta längd meddelande")
  .max(100, "Maximal längd meddelande")
  .regex(/pattern/, "Regex felmeddelande")

// Email
z.string().email("Ange en giltig e-postadress")

// Optional with refine
z.string()
  .optional()
  .refine(
    (val) => !val || /pattern/.test(val),
    "Felmeddelande"
  )

// Custom validation
z.object({...})
  .refine(
    (data) => data.startTime < data.endTime,
    { 
      message: "Sluttid måste vara efter starttid", 
      path: ["endTime"]  // Path to field that shows error
    }
  )

// Type inference
export type BookingFormData = z.infer<typeof bookingFormSchema>;
```

---

## 8. Layout & Page Structure Patterns

### 8.1 Root Layout

**File**: `/home/youhad/boklin/src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Boklin - Title", template: "%s | Boklin" },
  description: "Description",
  // ... more metadata
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
        <div className="linen-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
```

### 8.2 Page Metadata

**Pattern**: Define metadata at page level

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instrumentpanel",
  description: "Hantera dina bokningar och inställningar.",
};

export default async function Page() {
  // ...
}
```

### 8.3 Async Server Components

```typescript
// Standard server component pattern
export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/logga-in");
  }

  // Can use await directly
  const data = await fetchData();

  return <div>{/* render */}</div>;
}
```

---

## 9. State Management Patterns

### 9.1 Client Component State

**Pattern**: Use React hooks for local state

```typescript
"use client";

import { useState } from "react";

export function BookingWidget({ eventType }: Props) {
  const [step, setStep] = useState<"date" | "time" | "details">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep("time");
  };

  return <div>{/* render based on state */}</div>;
}
```

### 9.2 Lifting State Pattern

```typescript
// Parent component manages state
export function BookingWidget() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <>
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      {selectedDate && (
        <TimeSlotPicker
          date={selectedDate}
          slots={slots}
          onSelectTime={handleTimeSelect}
        />
      )}
    </>
  );
}
```

---

## 10. Component Composition Patterns

### 10.1 Multi-Step Component

**File**: `/home/youhad/boklin/src/app/[username]/[eventSlug]/booking-widget.tsx`

```typescript
"use client";

import { useState } from "react";

type Step = "date" | "time" | "details" | "confirmed";

export function BookingWidget({ eventType, user }: BookingWidgetProps) {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  if (step === "confirmed") {
    return <ConfirmationScreen />;
  }

  return (
    <div>
      {step === "date" && (
        <CalendarGrid selectedDate={selectedDate} onSelectDate={handleDateSelect} />
      )}

      {step === "time" && selectedDate && (
        <TimeSlotPicker date={selectedDate} slots={slots} onSelectTime={handleTimeSelect} />
      )}

      {step === "details" && selectedDate && selectedTime && (
        <BookingForm
          eventType={eventType}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSubmit={handleSubmit}
          onBack={() => setStep("time")}
        />
      )}
    </div>
  );
}
```

### 10.2 Composed UI Components

```typescript
// Usage pattern
<Card variant="light">
  <CardHeader>
    <CardTitle>Din bokningslänk</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
  <CardFooter>
    {/* actions */}
  </CardFooter>
</Card>
```

---

## 11. Common Implementation Checklist

When implementing new features, follow this checklist:

- [ ] **Authentication**: Add protected route to middleware if needed
- [ ] **Database**: Add table to schema with relations, or use existing
- [ ] **Validation**: Create Zod schema in `/validations/`
- [ ] **Types**: Add types to `/types/index.ts` if creating new entities
- [ ] **UI Components**: Use existing components (Button, Input, Card)
- [ ] **Forms**: Use Input component with error/hint support
- [ ] **Styling**: Use `cn()` utility, apply design tokens
- [ ] **Routing**: Use route groups, correct layout hierarchy
- [ ] **Translations**: Add Swedish text to `sv.ts` i18n file
- [ ] **Metadata**: Add page title and description
- [ ] **Accessibility**: Use aria attributes, semantic HTML
- [ ] **Mobile**: Test responsive design (md: breakpoint)

---

## 12. Key File References

**Core Files**:
- `/home/youhad/boklin/src/lib/auth/index.ts` - Authentication config
- `/home/youhad/boklin/src/lib/db/schema.ts` - Database schema
- `/home/youhad/boklin/src/lib/utils.ts` - Utility functions
- `/home/youhad/boklin/src/lib/i18n/sv.ts` - Swedish translations
- `/home/youhad/boklin/src/types/index.ts` - Type definitions
- `/home/youhad/boklin/src/middleware.ts` - Route protection

**Components**:
- `/home/youhad/boklin/src/components/ui/` - Base UI components
- `/home/youhad/boklin/src/components/booking/` - Booking flow components
- `/home/youhad/boklin/src/components/dashboard/` - Dashboard components

**Pages**:
- `/home/youhad/boklin/src/app/(auth)/` - Auth pages
- `/home/youhad/boklin/src/app/(dashboard)/` - Protected dashboard
- `/home/youhad/boklin/src/app/[username]/[eventSlug]/` - Public booking

**Styling**:
- `/home/youhad/boklin/src/app/globals.css` - Design tokens & global styles
