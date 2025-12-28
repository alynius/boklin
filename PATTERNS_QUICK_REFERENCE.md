# Boklin Patterns Quick Reference

Quick lookup guide for the most common patterns when building features.

## Authentication

```typescript
// Server component - get current user
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user) redirect("/logga-in");

// Client component - sign in/out
import { signIn, signOut } from "next-auth/react";
signIn("google", { callbackUrl: "/instrumentpanel" });
signOut({ callbackUrl: "/" });
```

## Forms & Validation

```typescript
// Define schema (src/lib/validations/schema.ts)
import { z } from "zod";
export const formSchema = z.object({
  email: z.string().email("Ange en giltig e-postadress"),
  name: z.string().min(2, "Minst 2 tecken").max(100, "Max 100 tecken"),
});
export type FormData = z.infer<typeof formSchema>;

// Use in component
<Input
  label="E-post"
  name="email"
  error={errors.email}
  type="email"
/>
```

## Components

```typescript
// Button variations
<Button variant="primary" size="lg">Text</Button>
<Button variant="secondary" size="md">Text</Button>
<Button variant="ghost">Text</Button>
<Button variant="danger">Text</Button>

// Card
<Card variant="light">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>

// Label mono (uppercase, monospace)
<LabelMono size="sm">Label</LabelMono>
```

## Styling

```typescript
// Colors (use Tailwind classes)
bg-canvas           // Page background
bg-panel-light      // Cards, forms
bg-panel-dark       // Headers, dark panels
bg-panel-slots      // Time slots
text-text-dark      // Primary text
text-text-light     // Text on dark
text-accent         // Buttons, links
hover:bg-hover-day  // Calendar day hover

// Utilities
className="transition-smooth"  // 0.4s cubic-bezier easing
className="label-mono"         // Uppercase, tracking, opacity-60

// cn() utility (merge Tailwind classes)
import { cn } from "@/lib/utils";
className={cn("base", condition && "conditional")}
```

## Database

```typescript
// Import db and schema
import { db } from "@/lib/db";
import { users, eventTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Query pattern
const result = await db
  .select()
  .from(eventTypes)
  .where(eq(eventTypes.userId, userId));
```

## Utilities

```typescript
// Formatting
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
formatDate(new Date())    // "28 december 2025"
formatTime(new Date())    // "14:30"
formatDuration(90)        // "1 timme 30 min"

// Slugify (handles Swedish chars)
import { slugify } from "@/lib/utils";
slugify("Min Mötestyp")   // "min-moetstyp"

// Translations
import { sv } from "@/lib/i18n/sv";
sv.common.save            // "Spara"
sv.booking.selectDate     // "Välj datum"
sv.errors.generic         // "Något gick fel. Försök igen."
```

## Routing

```typescript
// Route groups (no URL prefix)
src/app/(auth)/logga-in/      // /logga-in
src/app/(dashboard)/bokningar/ // /bokningar

// Protected route
// 1. Add to middleware.ts protectedPaths
// 2. Add auth check in layout
const session = await auth();
if (!session?.user) redirect("/logga-in");

// Navigation
import Link from "next/link";
<Link href="/bokningar">Bokningar</Link>

// Dynamic routes
// src/app/[username]/[eventSlug]/page.tsx
interface Props {
  params: Promise<{ username: string; eventSlug: string }>;
}
export default async function Page({ params }: Props) {
  const { username, eventSlug } = await params;
}
```

## Client Component Pattern

```typescript
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button, Input, Card } from "@/components/ui";

export function MyComponent() {
  const [state, setState] = useState<string>("");
  
  return (
    <Card>
      <Input value={state} onChange={(e) => setState(e.target.value)} />
      <Button onClick={() => console.log(state)}>Submit</Button>
    </Card>
  );
}
```

## Server Component Pattern

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/logga-in");

  const data = await db.select().from(users).where(/* ... */);
  
  if (!data) notFound();

  return <div>{/* render */}</div>;
}
```

## Types

```typescript
// From @/types
import type {
  User,
  EventType,
  Booking,
  Availability,
  TimeSlot,
  BookingStatus,
  DayOfWeek,
} from "@/types";

// Constants
import { DAY_NAMES_SV, DAY_NAMES_SHORT_SV } from "@/types";
```

## SVG Icons

Use lucide-react:
```typescript
import { Calendar, Clock, Users, ChevronLeft } from "lucide-react";

<Calendar className="w-5 h-5" />
```

## Metadata

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description 140-160 chars",
};
```

## Multi-Step Form Pattern

```typescript
type Step = "step1" | "step2" | "step3";

export function Component() {
  const [step, setStep] = useState<Step>("step1");
  const [data, setData] = useState({});

  if (step === "step3") return <ConfirmationScreen data={data} />;

  return (
    <>
      {step === "step1" && <Step1 onNext={() => setStep("step2")} />}
      {step === "step2" && <Step2 onBack={() => setStep("step1")} onNext={() => setStep("step3")} />}
    </>
  );
}
```

## Common Mistakes to Avoid

1. **Not awaiting auth()** in server components
2. **Missing error prop** on Input component
3. **Not using cn()** for conditional classes
4. **Hardcoded Swedish text** instead of `sv` constants
5. **Not checking params as Promise** in dynamic routes
6. **Forgetting redirect import** from "next/navigation"
7. **Using `export` instead of `export const`** for server functions
8. **Not setting page metadata** for SEO

## File Locations

- Auth: `/home/youhad/boklin/src/lib/auth/index.ts`
- Database: `/home/youhad/boklin/src/lib/db/schema.ts`
- Utils: `/home/youhad/boklin/src/lib/utils.ts`
- Translations: `/home/youhad/boklin/src/lib/i18n/sv.ts`
- Types: `/home/youhad/boklin/src/types/index.ts`
- Validations: `/home/youhad/boklin/src/lib/validations/`
- UI Components: `/home/youhad/boklin/src/components/ui/`
- Booking Components: `/home/youhad/boklin/src/components/booking/`
- Pages: `/home/youhad/boklin/src/app/`
