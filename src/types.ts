import { z } from 'zod';

// Schema for the "Do Not Disturb" object
export const DndSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
});

// Schema for a single event setting
export const EventSettingSchema = z.object({
  enabled: z.boolean(),
});

// Schema for the complete user preferences object
export const PreferencesSchema = z.object({
  dnd: DndSchema,
  eventSettings: z.record(z.string(), EventSettingSchema),
});

// Deriving the TypeScript type from the Zod schema
export type Preferences = z.infer<typeof PreferencesSchema>;

// Schema for an incoming event
export const EventSchema = z.object({
    eventId: z.string(),
    userId: z.string(),
    eventType: z.string(),
    timestamp: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

// Deriving the TypeScript type from the Zod schema
export type Event = z.infer<typeof EventSchema>;
