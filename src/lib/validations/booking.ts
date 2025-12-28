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

export const eventTypeSchema = z.object({
  title: z
    .string()
    .min(2, "Titeln måste vara minst 2 tecken")
    .max(100, "Titeln får inte vara längre än 100 tecken"),
  slug: z
    .string()
    .min(2, "Slug måste vara minst 2 tecken")
    .max(50, "Slug får inte vara längre än 50 tecken")
    .regex(/^[a-z0-9-]+$/, "Slug får endast innehålla små bokstäver, siffror och bindestreck"),
  description: z
    .string()
    .max(500, "Beskrivningen får inte vara längre än 500 tecken")
    .optional(),
  duration: z
    .number()
    .min(5, "Mötet måste vara minst 5 minuter")
    .max(480, "Mötet kan inte vara längre än 8 timmar"),
  price: z
    .number()
    .min(0, "Priset kan inte vara negativt")
    .optional(),
  location: z.object({
    type: z.enum(["in_person", "phone", "video", "custom"]),
    address: z.string().optional(),
    link: z.string().url().optional(),
    phone: z.string().optional(),
    instructions: z.string().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
  requiresConfirmation: z.boolean().default(false),
  bufferBefore: z.number().min(0).max(120).default(0),
  bufferAfter: z.number().min(0).max(120).default(0),
  minNotice: z.number().min(0).max(168).default(24), // max 1 week
  maxFuture: z.number().min(1).max(365).default(60),
});

export type EventTypeFormData = z.infer<typeof eventTypeSchema>;

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ange tid i formatet HH:mm"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ange tid i formatet HH:mm"),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: "Sluttid måste vara efter starttid", path: ["endTime"] }
);

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Namnet måste vara minst 2 tecken")
    .max(100, "Namnet får inte vara längre än 100 tecken"),
  username: z
    .string()
    .min(3, "Användarnamnet måste vara minst 3 tecken")
    .max(50, "Användarnamnet får inte vara längre än 50 tecken")
    .regex(/^[a-z0-9-]+$/, "Användarnamnet får endast innehålla små bokstäver, siffror och bindestreck"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const timezoneSchema = z.object({
  timezone: z.string().min(1, "Tidszon måste anges"),
});

export type TimezoneFormData = z.infer<typeof timezoneSchema>;
