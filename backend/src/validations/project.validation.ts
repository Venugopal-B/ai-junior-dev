import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    primary_language: z.string().min(1).max(50).default('TypeScript'),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    primary_language: z.string().min(1).max(50).optional(),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
