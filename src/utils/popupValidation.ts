import { z } from 'zod';

export const popupConfigSchema = z.object({
  enabled: z.boolean(),
  subheading: z.string().max(100, 'Subheading must be 100 characters or less').optional().or(z.literal('')),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  body: z.string().min(1, 'Body text is required').max(1000, 'Body must be 1000 characters or less'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  button_text: z.string().min(1, 'Button text is required').max(50, 'Button text must be 50 characters or less'),
  button_link: z.string().min(1, 'Button link is required').refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return val.startsWith('/') || val.startsWith('#');
      }
    },
    { message: 'Must be a valid URL or start with / or #' }
  ),
  dismissal_text: z.string().max(50, 'Dismissal text must be 50 characters or less').optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  reappear_hours: z.number().int().min(1, 'Must be at least 1 hour').max(24, 'Must be 24 hours or less'),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

export const popupPresetSchema = z.object({
  name: z.string().min(1, 'Preset name is required').max(100, 'Preset name must be 100 characters or less'),
  subheading: z.string().max(100, 'Subheading must be 100 characters or less').optional().or(z.literal('')),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  body: z.string().min(1, 'Body text is required').max(1000, 'Body must be 1000 characters or less'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  button_text: z.string().min(1, 'Button text is required').max(50, 'Button text must be 50 characters or less'),
  button_link: z.string().min(1, 'Button link is required').refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return val.startsWith('/') || val.startsWith('#');
      }
    },
    { message: 'Must be a valid URL or start with / or #' }
  ),
  dismissal_text: z.string().max(50, 'Dismissal text must be 50 characters or less').optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  reappear_hours: z.number().int().min(1, 'Must be at least 1 hour').max(24, 'Must be 24 hours or less'),
  tags: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

export type PopupConfigInput = z.infer<typeof popupConfigSchema>;
export type PopupPresetInput = z.infer<typeof popupPresetSchema>;
