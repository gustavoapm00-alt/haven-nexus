import { z } from 'zod';

export const enterpriseIntakeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  title: z.string().trim().min(1, 'Title is required').max(100),
  email: z.string().trim().min(1, 'Email is required').max(255).email('Invalid email'),
  organization: z.string().trim().min(1, 'Organization is required').max(200),
  cage_code: z.string().trim().max(20).optional().or(z.literal('')),
  naics_codes: z.string().trim().max(200).optional().or(z.literal('')),
  contract_vehicle: z.string().optional().or(z.literal('')),
  compliance_needs: z.array(z.string()).min(1, 'Select at least one compliance domain'),
  current_posture: z.string().min(1, 'Select current compliance posture'),
  team_size: z.string().min(1, 'Select team size'),
  primary_challenge: z.string().trim().min(1, 'Describe your primary challenge').max(5000),
  timeline: z.string().min(1, 'Select engagement timeline'),
  additional_context: z.string().trim().max(5000).optional().or(z.literal('')),
});

export type EnterpriseIntakeData = z.infer<typeof enterpriseIntakeSchema>;
