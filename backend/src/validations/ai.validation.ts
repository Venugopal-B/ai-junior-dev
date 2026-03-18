import { z } from 'zod';

export const aiRequestSchema = z.object({
  body: z.object({
    fileId: z.string().uuid('Invalid file ID'),
    projectId: z.string().uuid('Invalid project ID'),
  }),
});

export type AIRequestInput = z.infer<typeof aiRequestSchema>['body'];
