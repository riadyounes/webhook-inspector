import { z } from 'zod'

export const webhooksListItemSchema = z.object({
  id: z.string(),
  method: z.string(),
  pathname: z.string(),
  createdAt: z.coerce.date(),
})

export const webhooksListSchema = z.object({
  webhooks: z.array(webhooksListItemSchema),
  nextCursor: z.string().nullable(),
})
