/**
 * Core type definitions for Boklin
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event type definitions
export interface EventType {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  duration: number; // in minutes
  price?: number; // in SEK öre (cents)
  currency: "SEK";
  location?: EventLocation;
  color?: string;
  isActive: boolean;
  requiresConfirmation: boolean;
  bufferBefore: number; // minutes
  bufferAfter: number; // minutes
  minNotice: number; // hours
  maxFuture: number; // days
  createdAt: Date;
  updatedAt: Date;
}

export type EventLocationType = "in_person" | "phone" | "video" | "custom";

export interface EventLocation {
  type: EventLocationType;
  address?: string;
  link?: string;
  phone?: string;
  instructions?: string;
}

// Availability types
export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES_SV: Record<DayOfWeek, string> = {
  0: "Söndag",
  1: "Måndag",
  2: "Tisdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lördag",
};

export const DAY_NAMES_SHORT_SV: Record<DayOfWeek, string> = {
  0: "Sön",
  1: "Mån",
  2: "Tis",
  3: "Ons",
  4: "Tor",
  5: "Fre",
  6: "Lör",
};

// Booking types
export interface Booking {
  id: string;
  eventTypeId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestNotes?: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  calendarEventId?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

// Time slot for booking UI
export interface TimeSlot {
  time: Date;
  available: boolean;
}

// Calendar integration types
export interface CalendarConnection {
  id: string;
  userId: string;
  provider: CalendarProvider;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  isPrimary: boolean;
  createdAt: Date;
}

export type CalendarProvider = "google" | "outlook";

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
