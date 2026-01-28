import { z } from 'zod';

export const emailSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .email('Please enter a valid email address'),
});

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .email('Please enter a valid email address'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(5000, 'Message must be less than 5000 characters'),
});

export const engagementFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .email('Please enter a valid email address'),
  company_name: z
    .string()
    .trim()
    .max(200, 'Company name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(500, 'Website must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  team_size: z
    .string()
    .min(1, 'Please select your team size'),
  primary_goal: z
    .string()
    .min(1, 'Please select your primary goal'),
  current_tools: z
    .array(z.string())
    .default([]),
  operational_pain: z
    .string()
    .trim()
    .min(1, 'Please describe your biggest operational pain')
    .max(5000, 'Description must be less than 5000 characters'),
  calm_in_30_days: z
    .string()
    .trim()
    .max(500, 'Response must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type EmailSignupData = z.infer<typeof emailSignupSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type EngagementFormData = z.infer<typeof engagementFormSchema>;
