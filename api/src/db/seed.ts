import { faker } from '@faker-js/faker'
import { db } from './index'
import { webhooks } from './schema/webhooks'

// Tipos de eventos comuns do Stripe
const STRIPE_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.created',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'invoice.created',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.finalized',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'subscription.created',
  'subscription.updated',
  'subscription.deleted',
  'checkout.session.completed',
]

function generateStripeWebhook(createdAt: Date) {
  const eventType = faker.helpers.arrayElement(STRIPE_EVENTS)
  const method = 'POST'
  const pathname = '/webhooks/stripe'
  const ip = faker.internet.ipv4()

  // Gerar dados do evento baseado no tipo
  const eventData = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(createdAt.getTime() / 1000),
    type: eventType,
    data: {
      object: generateEventObject(eventType, createdAt),
    },
    livemode: faker.datatype.boolean(),
    pending_webhooks: faker.number.int({ min: 0, max: 3 }),
    request: {
      id: `req_${faker.string.alphanumeric(24)}`,
      idempotency_key: faker.string.uuid(),
    },
  }

  const body = JSON.stringify(eventData, null, 2)
  const contentLength = Buffer.byteLength(body)

  return {
    method,
    pathname,
    ip,
    statusCode: 200,
    contentType: 'application/json',
    contentLength,
    queryParams: null,
    headers: {
      'content-type': 'application/json',
      'stripe-signature': `t=${createdAt.getTime()},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      accept: '*/*',
      host: faker.internet.domainName(),
    },
    body,
    createdAt,
  }
}

function generateEventObject(eventType: string, createdAt: Date) {
  const baseObject = {
    id: faker.string.alphanumeric(24),
    object: '',
    created: Math.floor(createdAt.getTime() / 1000),
  }

  if (eventType.startsWith('payment_intent')) {
    return {
      ...baseObject,
      object: 'payment_intent',
      amount: faker.number.int({ min: 1000, max: 100000 }),
      amount_received: faker.number.int({ min: 1000, max: 100000 }),
      currency: faker.helpers.arrayElement(['usd', 'eur', 'gbp', 'brl']),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      description: faker.commerce.productDescription(),
      status: eventType.includes('succeeded')
        ? 'succeeded'
        : eventType.includes('failed')
          ? 'failed'
          : 'processing',
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
      metadata: {
        order_id: faker.string.uuid(),
        customer_name: faker.person.fullName(),
      },
    }
  }

  if (eventType.startsWith('charge')) {
    return {
      ...baseObject,
      object: 'charge',
      amount: faker.number.int({ min: 1000, max: 100000 }),
      currency: faker.helpers.arrayElement(['usd', 'eur', 'gbp', 'brl']),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      description: faker.commerce.productDescription(),
      status: eventType.includes('succeeded') ? 'succeeded' : 'failed',
      paid: eventType.includes('succeeded'),
      refunded: eventType.includes('refunded'),
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
      receipt_url: faker.internet.url(),
    }
  }

  if (eventType.startsWith('invoice')) {
    return {
      ...baseObject,
      object: 'invoice',
      amount_due: faker.number.int({ min: 1000, max: 50000 }),
      amount_paid: eventType.includes('paid')
        ? faker.number.int({ min: 1000, max: 50000 })
        : 0,
      currency: faker.helpers.arrayElement(['usd', 'eur', 'gbp', 'brl']),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: eventType.includes('paid')
        ? 'paid'
        : eventType.includes('failed')
          ? 'open'
          : 'draft',
      number: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
      hosted_invoice_url: faker.internet.url(),
      invoice_pdf: faker.internet.url(),
    }
  }

  if (eventType.startsWith('customer')) {
    return {
      ...baseObject,
      object: 'customer',
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      address: {
        line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postal_code: faker.location.zipCode(),
        country: faker.location.countryCode(),
      },
      description: faker.company.catchPhrase(),
      metadata: {
        user_id: faker.string.uuid(),
      },
    }
  }

  if (
    eventType.startsWith('subscription') ||
    eventType.includes('subscription')
  ) {
    return {
      ...baseObject,
      object: 'subscription',
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: faker.helpers.arrayElement([
        'active',
        'canceled',
        'past_due',
        'trialing',
      ]),
      current_period_start: Math.floor(createdAt.getTime() / 1000),
      current_period_end:
        Math.floor(createdAt.getTime() / 1000) + 365 * 24 * 60 * 60,
      plan: {
        id: `plan_${faker.string.alphanumeric(14)}`,
        amount: faker.number.int({ min: 999, max: 9999 }),
        currency: faker.helpers.arrayElement(['usd', 'eur', 'gbp', 'brl']),
        interval: faker.helpers.arrayElement(['month', 'year']),
        product: `prod_${faker.string.alphanumeric(14)}`,
      },
      items: {
        data: [
          {
            id: `si_${faker.string.alphanumeric(14)}`,
            price: {
              id: `price_${faker.string.alphanumeric(14)}`,
              product: faker.commerce.product(),
              unit_amount: faker.number.int({ min: 999, max: 9999 }),
            },
          },
        ],
      },
    }
  }

  if (eventType.startsWith('checkout')) {
    return {
      ...baseObject,
      object: 'checkout.session',
      amount_total: faker.number.int({ min: 1000, max: 100000 }),
      currency: faker.helpers.arrayElement(['usd', 'eur', 'gbp', 'brl']),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      customer_email: faker.internet.email(),
      payment_status: 'paid',
      status: 'complete',
      success_url: faker.internet.url(),
      url: faker.internet.url(),
    }
  }

  return baseObject
}

async function seed() {
  console.log('🌱 Iniciando seed dos webhooks...')

  // Limpar tabela antes de inserir (opcional)
  await db.delete(webhooks)
  console.log('🗑️  Tabela limpa')

  // Gerar 60 webhooks em ordem decrescente de data
  // O primeiro webhook terá a data mais antiga (30 dias atrás)
  // O último webhook terá a data mais recente (agora)
  const totalWebhooks = 60
  const daysRange = 30
  const now = new Date()
  const oldestDate = new Date(now.getTime() - daysRange * 24 * 60 * 60 * 1000)

  const webhooksData = Array.from({ length: totalWebhooks }, (_, index) => {
    // Calcula a data proporcional ao índice
    // index 0 = data mais antiga, index 59 = data mais recente
    const progress = index / (totalWebhooks - 1)
    const timestamp =
      oldestDate.getTime() + progress * (now.getTime() - oldestDate.getTime())
    const createdAt = new Date(timestamp)

    return generateStripeWebhook(createdAt)
  })

  // Inserir em batch
  await db.insert(webhooks).values(webhooksData)

  console.log(`✅ ${webhooksData.length} webhooks criados com sucesso!`)

  // Mostrar alguns exemplos
  console.log('\n📊 Exemplos de eventos criados:')
  const eventTypes = webhooksData.reduce(
    (acc: Record<string, number>, webhook) => {
      const event = JSON.parse(webhook.body)
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    },
    {},
  )

  console.table(eventTypes)

  // Mostrar as datas do primeiro e último webhook
  console.log('\n📅 Intervalo de datas:')
  console.log(
    `Mais antigo: ${webhooksData[0].createdAt.toISOString()}`,
  )
  console.log(
    `Mais recente: ${webhooksData[webhooksData.length - 1].createdAt.toISOString()}`,
  )

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Erro ao executar seed:', error)
  process.exit(1)
})
