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

export type EmailSignupData = z.infer<typeof emailSignupSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
