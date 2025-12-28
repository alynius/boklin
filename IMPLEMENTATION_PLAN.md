# Boklin Implementation Plan

## Current State Summary

| Category | Completion | Notes |
|----------|------------|-------|
| Database Schema | 100% | Full Drizzle schema with relations |
| Auth System | 100% | NextAuth v5 with Google OAuth |
| UI Components | 100% | Button, Input, Card, LabelMono |
| Booking Components | 100% | CalendarGrid, TimeSlotPicker, BookingForm |
| Design System | 100% | Nordic Linen tokens in globals.css |
| i18n/Translations | 100% | Swedish translations complete |
| Validation Schemas | 100% | Zod schemas for all forms |
| Types | 100% | Full TypeScript types |
| Home Page | 100% | Marketing landing page |
| Auth Pages | 100% | Sign in/up with Google OAuth |
| Dashboard Layout | 100% | Header, sidebar, protected routes |
| Dashboard Pages | 20% | Only instrumentpanel stub exists |
| Public Booking | 60% | UI done, uses mock data |
| API Routes | 10% | Only NextAuth handlers |
| Database Queries | 0% | No service layer exists |
| Email Integration | 0% | Resend not wired up |
| Calendar Sync | 0% | Schema exists, no OAuth flow |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  Pages (App Router)                                              │
│  ├── (marketing)/ → Landing, Pricing, About                     │
│  ├── (auth)/ → Sign in, Sign up                                 │
│  ├── (dashboard)/ → Protected dashboard pages                   │
│  └── [username]/ → Public booking pages                         │
├─────────────────────────────────────────────────────────────────┤
│  Components                                                      │
│  ├── ui/ → Base design system components                        │
│  ├── booking/ → Calendar, time picker, form                     │
│  ├── dashboard/ → Nav, stats, tables                            │
│  └── forms/ → Event type, availability, settings forms          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER ACTIONS                              │
│  src/lib/actions/                                                │
│  ├── bookings.ts → Create, cancel, list bookings                │
│  ├── event-types.ts → CRUD event types                          │
│  ├── availability.ts → CRUD availability slots                  │
│  ├── users.ts → Profile updates, settings                       │
│  └── calendar.ts → Calendar sync operations                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  src/lib/db/queries/                                             │
│  ├── bookings.ts → Booking queries                              │
│  ├── event-types.ts → Event type queries                        │
│  ├── availability.ts → Availability queries                     │
│  ├── users.ts → User queries                                    │
│  └── calendar.ts → Calendar connection queries                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│  PostgreSQL (Neon) via Drizzle ORM                              │
│  Tables: users, accounts, sessions, eventTypes,                 │
│          availability, bookings, calendarConnections            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Data Layer Foundation (Sequential - Must Complete First)
**Estimated complexity: Medium**

These must be built first as all features depend on them.

#### 1.1 Database Query Functions
Create `src/lib/db/queries/` directory with typed query functions:

```
src/lib/db/queries/
├── index.ts          # Barrel exports
├── users.ts          # getUserById, getUserByUsername, updateUser
├── event-types.ts    # getEventTypes, getEventTypeBySlug, createEventType, updateEventType, deleteEventType
├── availability.ts   # getAvailability, setAvailability, getAvailableSlots
├── bookings.ts       # getBookings, getBookingById, createBooking, updateBookingStatus, cancelBooking
└── calendar.ts       # getCalendarConnections, addCalendarConnection, removeCalendarConnection
```

**Key functions needed:**

```typescript
// users.ts
export async function getUserById(id: string): Promise<User | null>
export async function getUserByUsername(username: string): Promise<User | null>
export async function updateUser(id: string, data: Partial<User>): Promise<User>
export async function getUserStats(userId: string): Promise<DashboardStats>

// event-types.ts
export async function getEventTypesByUserId(userId: string): Promise<EventType[]>
export async function getEventTypeBySlug(userId: string, slug: string): Promise<EventType | null>
export async function getPublicEventTypes(username: string): Promise<EventType[]>
export async function createEventType(userId: string, data: EventTypeInput): Promise<EventType>
export async function updateEventType(id: string, data: Partial<EventType>): Promise<EventType>
export async function deleteEventType(id: string): Promise<void>

// availability.ts
export async function getAvailabilityByUserId(userId: string): Promise<Availability[]>
export async function setAvailability(userId: string, slots: AvailabilityInput[]): Promise<void>
export async function getAvailableSlots(userId: string, eventTypeId: string, date: Date): Promise<TimeSlot[]>

// bookings.ts
export async function getBookingsByUserId(userId: string, filters?: BookingFilters): Promise<Booking[]>
export async function getBookingById(id: string): Promise<Booking | null>
export async function createBooking(data: BookingInput): Promise<Booking>
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>
export async function cancelBooking(id: string, reason?: string): Promise<void>
export async function getUpcomingBookings(userId: string, limit?: number): Promise<Booking[]>
```

#### 1.2 Server Actions
Create `src/lib/actions/` directory with Next.js Server Actions:

```
src/lib/actions/
├── index.ts
├── bookings.ts       # createBookingAction, cancelBookingAction
├── event-types.ts    # createEventTypeAction, updateEventTypeAction, deleteEventTypeAction
├── availability.ts   # updateAvailabilityAction
└── users.ts          # updateProfileAction, updateSettingsAction
```

**Pattern to follow:**

```typescript
// src/lib/actions/bookings.ts
"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { bookingFormSchema } from "@/lib/validations/booking";
import { createBooking } from "@/lib/db/queries/bookings";

export async function createBookingAction(formData: FormData) {
  const parsed = bookingFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Validering misslyckades", issues: parsed.error.issues };
  }

  try {
    const booking = await createBooking({
      ...parsed.data,
      eventTypeId: formData.get("eventTypeId") as string,
      startTime: new Date(formData.get("startTime") as string),
    });

    revalidatePath("/bokningar");
    return { success: true, booking };
  } catch (error) {
    return { error: "Kunde inte skapa bokning" };
  }
}
```

---

### Phase 2: Core Features (Can Run in Parallel)

Once Phase 1 is complete, these can be built in parallel by different developers or in separate work sessions.

#### 2A: Dashboard Features (Parallel Track A)

##### 2A.1 Dashboard Home (`/instrumentpanel`)
**File:** `src/app/(dashboard)/instrumentpanel/page.tsx`

**Requirements:**
- Fetch real stats from database (today, week, month, total bookings)
- Display upcoming bookings (next 5)
- Working "copy link" functionality
- Quick actions (create event type, view calendar)

**Data needed:**
```typescript
const stats = await getUserStats(session.user.id);
const upcoming = await getUpcomingBookings(session.user.id, 5);
```

**Edge cases:**
- New user with no bookings (empty states)
- User with no event types (prompt to create first)
- User with no username set (prompt to set)

##### 2A.2 Bookings List (`/bokningar`)
**Files:**
- `src/app/(dashboard)/bokningar/page.tsx`
- `src/components/dashboard/bookings-table.tsx`
- `src/components/dashboard/booking-filters.tsx`

**Requirements:**
- Table with columns: Guest, Event Type, Date/Time, Status, Actions
- Filter by status (pending, confirmed, cancelled, completed)
- Filter by date range
- Search by guest name/email
- Pagination (20 per page)
- Cancel booking action with confirmation modal
- Click row to view details

**Edge cases:**
- No bookings (empty state with CTA)
- Cancelled bookings display (strikethrough styling)
- Past bookings auto-marked as completed
- Timezone display considerations

##### 2A.3 Event Types (`/motestyper`)
**Files:**
- `src/app/(dashboard)/motestyper/page.tsx`
- `src/app/(dashboard)/motestyper/ny/page.tsx` (create)
- `src/app/(dashboard)/motestyper/[id]/page.tsx` (edit)
- `src/components/forms/event-type-form.tsx`

**Requirements:**
- List all event types with toggle active/inactive
- Create new event type form
- Edit existing event type
- Delete with confirmation
- Preview booking link
- Duplicate event type

**Form fields:**
- Title (required)
- Slug (auto-generated from title, editable)
- Description (optional, rich text)
- Duration (15, 30, 45, 60, 90, 120 minutes)
- Price (optional, SEK)
- Location type (in_person, phone, video, custom)
- Location details (address/link/phone based on type)
- Color picker
- Requires confirmation toggle
- Buffer before/after (0-60 minutes)
- Min notice (1-168 hours)
- Max future booking (7-90 days)

**Edge cases:**
- Slug collision (append number)
- Delete with existing bookings (soft delete or warn)
- Validate duration fits in availability slots

##### 2A.4 Availability (`/tillganglighet`)
**Files:**
- `src/app/(dashboard)/tillganglighet/page.tsx`
- `src/components/forms/availability-editor.tsx`
- `src/components/forms/time-range-input.tsx`

**Requirements:**
- Weekly schedule editor (Mon-Sun)
- Multiple time ranges per day
- Copy day to all days
- Mark day as unavailable
- Visual preview of weekly schedule
- Timezone display and setting

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ Måndag                              [+ Lägg till]│
│ ┌─────────────────────────────────────────────┐ │
│ │ 09:00 ─────────────────────────── 12:00 [×] │ │
│ │ 13:00 ─────────────────────────── 17:00 [×] │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Tisdag                              [+ Lägg till]│
│ ...                                             │
└─────────────────────────────────────────────────┘
```

**Edge cases:**
- Overlapping time ranges (validate and prevent)
- End time before start time (validate)
- No availability set (warn user)
- Timezone changes (recalculate slots)

##### 2A.5 Settings (`/installningar`)
**Files:**
- `src/app/(dashboard)/installningar/page.tsx`
- `src/app/(dashboard)/installningar/profil/page.tsx`
- `src/app/(dashboard)/installningar/konto/page.tsx`
- `src/app/(dashboard)/installningar/integrationer/page.tsx`
- `src/components/forms/profile-form.tsx`
- `src/components/forms/settings-form.tsx`

**Requirements:**
- Tab navigation: Profile, Account, Integrations
- Profile: Name, username, avatar upload
- Account: Email (read-only), timezone, language
- Integrations: Google Calendar connect/disconnect

**Edge cases:**
- Username already taken (validate async)
- Username format validation (lowercase, alphanumeric, hyphens)
- Avatar upload size/format limits
- Connected calendar token refresh

---

#### 2B: Public Booking Flow (Parallel Track B)

##### 2B.1 User Profile Page (`/[username]`)
**File:** `src/app/[username]/page.tsx`

**Requirements:**
- Fetch real user and event types from database
- Display user info (name, avatar)
- List active event types as cards
- 404 if username not found

**Edge cases:**
- User exists but has no active event types
- User has no availability set
- Very long event type list (pagination?)

##### 2B.2 Event Booking Page (`/[username]/[eventSlug]`)
**File:** `src/app/[username]/[eventSlug]/page.tsx`

**Requirements:**
- Fetch real event type data
- Calculate available slots based on:
  - User's availability settings
  - Existing bookings (blocked times)
  - Event type buffer times
  - Min notice period
  - Max future days
  - Connected calendar busy times (if available)
- Multi-step booking flow already exists in BookingWidget

**Slot Calculation Algorithm:**
```typescript
async function getAvailableSlots(
  userId: string,
  eventTypeId: string,
  date: Date
): Promise<TimeSlot[]> {
  // 1. Get user's availability for this day of week
  const dayAvailability = await getAvailabilityForDay(userId, date.getDay());

  // 2. Get event type details (duration, buffers)
  const eventType = await getEventTypeById(eventTypeId);

  // 3. Get existing bookings for this date
  const existingBookings = await getBookingsForDate(userId, date);

  // 4. Get calendar busy times (if connected)
  const calendarBusy = await getCalendarBusyTimes(userId, date);

  // 5. Generate slots from availability
  const allSlots = generateTimeSlots(
    dayAvailability,
    eventType.duration,
    15 // 15-minute increments
  );

  // 6. Filter out blocked times
  return allSlots.filter(slot => {
    const slotEnd = addMinutes(slot.time, eventType.duration);
    const slotWithBuffer = {
      start: subMinutes(slot.time, eventType.bufferBefore),
      end: addMinutes(slotEnd, eventType.bufferAfter),
    };

    // Check against existing bookings
    const hasBookingConflict = existingBookings.some(booking =>
      isOverlapping(slotWithBuffer, booking)
    );

    // Check against calendar busy times
    const hasCalendarConflict = calendarBusy.some(busy =>
      isOverlapping(slotWithBuffer, busy)
    );

    // Check min notice
    const meetsMinNotice = isAfter(
      slot.time,
      addHours(new Date(), eventType.minNotice)
    );

    return !hasBookingConflict && !hasCalendarConflict && meetsMinNotice;
  });
}
```

**Edge cases:**
- No slots available for selected date
- Event type inactive (404)
- Slot booked by another user during selection (race condition)
- Timezone differences (always use user's timezone)

##### 2B.3 Booking Confirmation
**File:** `src/app/[username]/[eventSlug]/bekraftelse/page.tsx`

**Requirements:**
- Show booking confirmation details
- Send confirmation email to guest
- Send notification email to host
- Add to calendar option (ICS download)
- Cancellation link

**Email templates needed:**
- Guest confirmation email
- Host notification email
- Cancellation confirmation email
- Reminder email (24h before)

---

#### 2C: Marketing Pages (Parallel Track C)

##### 2C.1 Pricing Page (`/priser`)
**File:** `src/app/(marketing)/priser/page.tsx`

**Requirements:**
- Pricing tiers (Free, Pro, Business)
- Feature comparison table
- FAQ section
- CTA buttons

**Content (Swedish):**
- Gratis: 1 mötestyp, grundläggande funktioner
- Pro: Obegränsade mötestyper, kalendersynk, anpassad branding
- Företag: Team-funktioner, API-åtkomst, prioriterad support

##### 2C.2 About Page (`/om-oss`)
**File:** `src/app/(marketing)/om-oss/page.tsx`

**Requirements:**
- Company story
- Team section (if applicable)
- Mission/values
- Contact information

---

### Phase 3: Email Integration (Sequential after Phase 2B)

##### 3.1 Email Service Setup
**Files:**
- `src/lib/email/index.ts`
- `src/lib/email/templates/booking-confirmation.tsx`
- `src/lib/email/templates/booking-notification.tsx`
- `src/lib/email/templates/booking-cancelled.tsx`
- `src/lib/email/templates/booking-reminder.tsx`

**Using Resend + React Email:**
```typescript
// src/lib/email/index.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(booking: Booking) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: booking.guestEmail,
    subject: `Bokning bekräftad: ${booking.eventType.title}`,
    react: BookingConfirmationEmail({ booking }),
  });
}
```

##### 3.2 Email Templates
Use React Email for templates with Nordic Linen styling.

---

### Phase 4: Calendar Integration (Sequential after Phase 1)

##### 4.1 Google Calendar OAuth
**Files:**
- `src/app/api/calendar/google/route.ts` (OAuth initiate)
- `src/app/api/calendar/google/callback/route.ts` (OAuth callback)
- `src/lib/calendar/google.ts`

**Flow:**
1. User clicks "Connect Google Calendar" in settings
2. Redirect to Google OAuth consent
3. Callback saves tokens to calendarConnections table
4. Background job syncs busy times

##### 4.2 Calendar Sync Service
**Files:**
- `src/lib/calendar/sync.ts`
- `src/lib/calendar/busy-times.ts`

**Requirements:**
- Fetch busy times from connected calendars
- Cache busy times (refresh every 5 minutes)
- Handle token refresh
- Create calendar events for new bookings

---

### Phase 5: Polish & Edge Cases (Sequential - Final)

##### 5.1 Error Handling
- Global error boundary
- Form validation error display
- Network error handling
- Rate limiting

##### 5.2 Loading States
- Skeleton loaders for tables
- Button loading states
- Page transition animations

##### 5.3 Empty States
- No bookings
- No event types
- No availability set
- No search results

##### 5.4 Accessibility
- Keyboard navigation
- Screen reader labels
- Focus management
- Color contrast verification

---

## Testing Strategy

### Unit Tests
**Location:** `__tests__/` or `*.test.ts` co-located

**Priority areas:**
1. Slot calculation algorithm (most complex logic)
2. Validation schemas
3. Utility functions
4. Date/time helpers

```typescript
// __tests__/lib/availability.test.ts
describe("getAvailableSlots", () => {
  it("returns empty array when no availability set", async () => {
    // ...
  });

  it("excludes slots that conflict with existing bookings", async () => {
    // ...
  });

  it("respects buffer times before and after", async () => {
    // ...
  });

  it("respects minimum notice period", async () => {
    // ...
  });

  it("handles timezone correctly", async () => {
    // ...
  });
});
```

### Integration Tests
**Using:** Playwright or Cypress

**Critical flows:**
1. Complete booking flow (guest perspective)
2. Create event type flow (host perspective)
3. Set availability flow
4. Cancel booking flow

### E2E Tests
**Scenarios:**
1. New user signup → create event type → share link → receive booking
2. Guest books → receives email → cancels booking
3. Host views dashboard → manages bookings

---

## File Creation Order

### Batch 1: Data Layer (Sequential)
```
1. src/lib/db/queries/index.ts
2. src/lib/db/queries/users.ts
3. src/lib/db/queries/event-types.ts
4. src/lib/db/queries/availability.ts
5. src/lib/db/queries/bookings.ts
6. src/lib/actions/index.ts
7. src/lib/actions/event-types.ts
8. src/lib/actions/availability.ts
9. src/lib/actions/bookings.ts
10. src/lib/actions/users.ts
```

### Batch 2: Dashboard Pages (Parallel A)
```
11. src/components/dashboard/stats-card.tsx
12. src/components/dashboard/upcoming-bookings.tsx
13. src/app/(dashboard)/instrumentpanel/page.tsx (update)
14. src/components/dashboard/bookings-table.tsx
15. src/components/dashboard/booking-filters.tsx
16. src/app/(dashboard)/bokningar/page.tsx
17. src/components/forms/event-type-form.tsx
18. src/app/(dashboard)/motestyper/page.tsx
19. src/app/(dashboard)/motestyper/ny/page.tsx
20. src/app/(dashboard)/motestyper/[id]/page.tsx
```

### Batch 3: Availability & Settings (Parallel A continued)
```
21. src/components/forms/time-range-input.tsx
22. src/components/forms/availability-editor.tsx
23. src/app/(dashboard)/tillganglighet/page.tsx
24. src/components/forms/profile-form.tsx
25. src/app/(dashboard)/installningar/page.tsx
26. src/app/(dashboard)/installningar/profil/page.tsx
27. src/app/(dashboard)/installningar/konto/page.tsx
```

### Batch 4: Public Booking (Parallel B)
```
28. src/lib/availability/slots.ts (slot calculation)
29. src/app/[username]/page.tsx (update with real data)
30. src/app/[username]/[eventSlug]/page.tsx (update with real data)
31. src/app/[username]/[eventSlug]/bekraftelse/page.tsx
```

### Batch 5: Email (Sequential after Batch 4)
```
32. src/lib/email/index.ts
33. src/lib/email/templates/booking-confirmation.tsx
34. src/lib/email/templates/booking-notification.tsx
35. src/lib/email/templates/booking-cancelled.tsx
```

### Batch 6: Marketing (Parallel C)
```
36. src/app/(marketing)/priser/page.tsx
37. src/app/(marketing)/om-oss/page.tsx
```

### Batch 7: Calendar Integration (Optional Enhancement)
```
38. src/lib/calendar/google.ts
39. src/app/api/calendar/google/route.ts
40. src/app/api/calendar/google/callback/route.ts
41. src/app/(dashboard)/installningar/integrationer/page.tsx
```

---

## Edge Cases & Error Handling Checklist

### Booking Flow
- [ ] Slot becomes unavailable during booking (optimistic lock)
- [ ] User navigates away mid-booking (save draft?)
- [ ] Email delivery fails (retry queue)
- [ ] Double-booking prevention (database constraint)
- [ ] Past date selection prevented
- [ ] Invalid timezone handling

### Event Types
- [ ] Slug collision resolution
- [ ] Delete with existing future bookings
- [ ] Duration longer than availability window
- [ ] Price with decimal values (store as öre)

### Availability
- [ ] Overlapping time ranges
- [ ] Cross-midnight availability (e.g., 22:00-02:00)
- [ ] Holiday/vacation blocking
- [ ] Timezone changes mid-booking

### Authentication
- [ ] Session expiry during form submission
- [ ] OAuth provider error
- [ ] Email already registered with different provider

### Data Integrity
- [ ] Cascading deletes (handled in schema)
- [ ] Orphaned records cleanup
- [ ] Audit trail for bookings

---

## Performance Considerations

### Database
- Index on `bookings.startTime` for date range queries
- Index on `bookings.userId` for user's bookings
- Index on `eventTypes.slug` + `eventTypes.userId` for lookups
- Index on `availability.userId` + `availability.dayOfWeek`

### Caching
- Cache available slots (invalidate on new booking)
- Cache user profile data
- Cache event type list

### Rendering
- Use React Server Components where possible
- Streaming for slow data fetches
- Suspense boundaries for progressive loading

---

## Security Checklist

- [ ] All dashboard routes protected by middleware
- [ ] Server actions validate session
- [ ] Input sanitization on all forms
- [ ] Rate limiting on booking creation
- [ ] CSRF protection (Next.js built-in)
- [ ] XSS prevention (React escaping)
- [ ] SQL injection prevention (Drizzle parameterized queries)
- [ ] Sensitive data encryption (calendar tokens)

---

## Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations run
- [ ] Email domain verified in Resend
- [ ] Google OAuth credentials for production domain
- [ ] Error monitoring (Sentry recommended)
- [ ] Analytics (optional)
- [ ] SSL certificate
- [ ] CDN for static assets
