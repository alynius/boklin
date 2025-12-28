/**
 * Type definitions for email service
 */

export interface BookingWithDetails {
  id: string;
  eventTypeId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestNotes: string | null;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  eventType: {
    id: string;
    userId: string;
    title: string;
    slug: string;
    description: string | null;
    duration: number;
    price: number | null;
    currency: string | null;
    location: {
      type: "in_person" | "phone" | "video" | "custom";
      address?: string;
      link?: string;
      phone?: string;
      instructions?: string;
    } | null;
    color: string | null;
    isActive: boolean;
    requiresConfirmation: boolean;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    image: string | null;
  };
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}
