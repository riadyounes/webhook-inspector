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

export const webhookDetailsSchema = z.object({
  id: z.string(),
  method: z.string(),
  pathname: z.string(),
  ip: z.string(),
  statusCode: z.number(),
  contentType: z.string().nullable(),
  contentLength: z.number().nullable(),
  queryParams: z.record(z.string(), z.string()).nullable(),
  headers: z.record(z.string(), z.string()).nullable(),
  body: z.string().nullable(),
  createdAt: z.coerce.date(),
})
