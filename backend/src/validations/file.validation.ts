import { z } from 'zod';

export const createFileSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid project ID') }),
  body: z.object({
    file_name: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Invalid file name'),
    file_path: z.string().max(500).default('/'),
    content: z.string().max(500_000, 'File content too large (max 500KB)'),
    language: z.string().max(64).default('TypeScript'),
  }),
});

export const fileIdSchema = z.object({
  params: z.object({ fileId: z.string().uuid('Invalid file ID') }),
});

export const updateFileSchema = z.object({
  params: z.object({ fileId: z.string().uuid('Invalid file ID') }),
  body: z.object({
    content: z.string().max(500_000, 'File content too large (max 500KB)'),
  }),
});

export type CreateFileInput = z.infer<typeof createFileSchema>['body'];
