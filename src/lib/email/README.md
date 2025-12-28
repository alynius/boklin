# Email Service

Email integration for Boklin using Resend and React Email.

## Setup

1. Add your Resend API key to `.env.local`:

```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="Boklin <noreply@boklin.se>"
```

2. Get your API key from [resend.com](https://resend.com)

## Templates

All templates are in Swedish and follow the Nordic Linen design system.

### BookingConfirmationEmail

Sent to guests after they create a booking (either pending or confirmed).

**Subject:**
- Pending: "Bokningsförfrågan mottagen: {eventTitle}"
- Confirmed: "Bokning bekräftad: {eventTitle} med {hostName}"

**Includes:**
- Booking details (date, time, duration)
- Event type information
- Host contact details
- Location information
- Links to add to calendar (ICS)
- Link to cancel booking

### BookingNotificationEmail

Sent to hosts when a guest creates a booking.

**Subject:**
- Pending: "Ny bokningsförfrågan: {eventTitle} från {guestName}"
- Confirmed: "Ny bokning: {eventTitle} från {guestName}"

**Includes:**
- Guest information (name, email, phone, notes)
- Booking details
- Action buttons (confirm/reject for pending bookings)

### BookingCancelledEmail

Sent to guests when a booking is cancelled.

**Subject:** "Bokning avbokad: {eventTitle}"

**Includes:**
- Cancelled booking details
- Cancellation reason (if provided)
- Link to rebook

## Usage

Email functions are integrated into booking actions in `src/lib/actions/bookings.ts`:

```typescript
import { sendBookingConfirmation, sendBookingNotification } from "@/lib/email";

// After creating a booking
await sendEmailSafely(
  () => sendBookingConfirmation(bookingWithDetails),
  "booking confirmation"
);
```

## Error Handling

All emails are sent using `sendEmailSafely()` which:
- Catches and logs errors without throwing
- Doesn't block the main operation (booking creation/cancellation)
- Continues even if email service is not configured

## Development

To test emails locally:

1. Set up a Resend account (free tier available)
2. Add your API key to `.env.local`
3. Create a booking through the UI
4. Check your email inbox

## Email Content Guidelines

- All text in Swedish
- Use Nordic Linen color palette
- Mobile-responsive design
- Clear call-to-action buttons
- Include all relevant booking information
- Provide way to contact host directly
