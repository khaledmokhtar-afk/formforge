import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function getStripe() {
  // @ts-expect-error - Stripe API version string
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, creditsPurchased } = session.metadata!

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data:  { credits: { increment: parseInt(creditsPurchased) } },
      }),
      prisma.payment.create({
        data: {
          userId,
          stripeSessionId:  session.id,
          stripePriceId:    '',
          creditsPurchased: parseInt(creditsPurchased),
          amountCents:      session.amount_total ?? 0,
          currency:         session.currency ?? 'usd',
          status:           'complete',
        },
      }),
    ])
  }

  return NextResponse.json({ received: true })
}
