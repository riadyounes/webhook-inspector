import { useSuspenseQuery } from '@tanstack/react-query'
import { webhooksListSchema } from '../http/schemas/webhooks'
import { WebhooksListItem } from './webhooks-list-item'

export function WebhooksList() {
  const { data } = useSuspenseQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/api/webhooks')
      const data = await response.json()
      return webhooksListSchema.parse(data)
    },
  })
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {data.webhooks.map((webhook) => (
          <WebhooksListItem key={webhook.id} webhook={webhook} />
        ))}
      </div>
    </div>
  )
}
