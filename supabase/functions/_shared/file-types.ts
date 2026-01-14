// Canonical file types for agent_files table
// Must match frontend: src/lib/file-types.ts

export const CANONICAL_FILE_TYPES = {
  workflow: 'workflow',
  deployment_guide: 'deployment_guide',
  requirements: 'requirements',
  prompt_template: 'prompt_template',
} as const;

export type CanonicalFileType = typeof CANONICAL_FILE_TYPES[keyof typeof CANONICAL_FILE_TYPES];

export const FILE_TYPE_LABELS: Record<CanonicalFileType, string> = {
  workflow: 'Workflow.json',
  deployment_guide: 'Deployment Guide.pdf',
  requirements: 'Requirements.md',
  prompt_template: 'Prompt Template.md',
};

export function getFileTypeLabel(type: string): string {
  return FILE_TYPE_LABELS[type as CanonicalFileType] || type;
}
