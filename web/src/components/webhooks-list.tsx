import { Loader2Icon, Wand2Icon } from 'lucide-react'
import { webhooksListSchema } from '../http/schemas/webhooks'
import { WebhooksListItem } from './webhooks-list-item'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CodeBlock } from './ui/code-block'

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
    string | null
  >(null)

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL('http://localhost:3333/api/webhooks')

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }
        const response = await fetch(url.toString())
        const data = await response.json()
        return webhooksListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCheckedWebhook(checkedWebhookId: string) {
    if (checkedWebhooksIds.includes(checkedWebhookId)) {
      setCheckedWebhooksIds((state) => {
        return state.filter((webhookId) => webhookId !== checkedWebhookId)
      })
    } else {
      setCheckedWebhooksIds((state) => [...state, checkedWebhookId])
    }
  }

  const hasAnyWebhookChecked = checkedWebhooksIds.length > 0

  async function handleGenerateHandler() {
    const response = await fetch('http://localhost:3333/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        webhookIds: checkedWebhooksIds,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    type GenerateResponse = { code: string }

    const data: GenerateResponse = await response.json()

    setGeneratedHandlerCode(data.code)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          <button
            disabled={!hasAnyWebhookChecked}
            className="bg-indigo-400 text-zinc-100 size-8 rounded-lg w-full flex items-center justify-center gap-3 font-medium text-sm py-2 mb-3 disabled:opacity-50"
            onClick={handleGenerateHandler}
          >
            <Wand2Icon className="size-4" />
            Gerar handler
          </button>

          {webhooks.map((webhook) => {
            return (
              <WebhooksListItem
                key={webhook.id}
                webhook={webhook}
                onWebhookChecked={handleCheckedWebhook}
                isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
              />
            )
          })}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2">
                <Loader2Icon className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}
      </div>
      {!!generatedHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className="bg-black/60 inset-0 fixed z-20">
            <Dialog.Content className="flex items-center justify-center fixed left-1/2 top-1/2 max-h-[85vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2">
              <div className="bg-zinc-900 w-[600px] p-4 rounded-lg border border-zinc-800 max-h-[620px] overflow-y-auto">
                <CodeBlock code={generatedHandlerCode} language="typescript" />
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Root>
      )}
    </>
  )
}
