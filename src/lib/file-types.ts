// Canonical file types for agent_files table
// Must match everywhere: admin UI, edge functions, download system

export const CANONICAL_FILE_TYPES = {
  workflow: 'workflow',
  deployment_guide: 'deployment_guide', 
  requirements: 'requirements',
  prompt_template: 'prompt_template',
} as const;

export type CanonicalFileType = typeof CANONICAL_FILE_TYPES[keyof typeof CANONICAL_FILE_TYPES];

export const FILE_TYPE_CONFIG: Record<CanonicalFileType, {
  label: string;
  shortLabel: string;
  accept: string;
  extension: string;
  icon: 'json' | 'pdf' | 'markdown';
  required: boolean;
}> = {
  workflow: {
    label: 'Workflow JSON',
    shortLabel: 'Workflow',
    accept: '.json',
    extension: 'json',
    icon: 'json',
    required: true,
  },
  deployment_guide: {
    label: 'Deployment Guide',
    shortLabel: 'Guide',
    accept: '.pdf,.md',
    extension: 'pdf',
    icon: 'pdf',
    required: false,
  },
  requirements: {
    label: 'Requirements',
    shortLabel: 'Requirements',
    accept: '.md,.txt',
    extension: 'md',
    icon: 'markdown',
    required: false,
  },
  prompt_template: {
    label: 'Prompt Template',
    shortLabel: 'Prompt',
    accept: '.md,.txt',
    extension: 'md',
    icon: 'markdown',
    required: false,
  },
};

export const ALL_FILE_TYPES = Object.keys(CANONICAL_FILE_TYPES) as CanonicalFileType[];

export function getFileTypeLabel(type: string): string {
  return FILE_TYPE_CONFIG[type as CanonicalFileType]?.label || type;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function buildStoragePath(
  slug: string,
  version: string,
  fileType: CanonicalFileType,
  extension: string
): string {
  return `agents/${slug}/${version}/${fileType}.${extension}`;
}
