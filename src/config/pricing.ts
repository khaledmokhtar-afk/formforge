export const CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: 9,
    perCredit: 9 / 5,
    popular: false,
    priceId: process.env.STRIPE_PRICE_STARTER ?? '',
    description: 'For occasional use',
  },
  {
    id: 'pro',
    name: 'Professional',
    credits: 20,
    price: 25,
    perCredit: 25 / 20,
    popular: true,
    priceId: process.env.STRIPE_PRICE_PRO ?? '',
    description: 'Most popular choice',
  },
  {
    id: 'studio',
    name: 'Studio',
    credits: 100,
    price: 79,
    perCredit: 79 / 100,
    popular: false,
    priceId: process.env.STRIPE_PRICE_STUDIO ?? '',
    description: 'For teams and studios',
  },
] as const

export type CreditPackId = typeof CREDIT_PACKS[number]['id']
