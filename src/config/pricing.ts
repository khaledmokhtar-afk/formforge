export const CREDIT_PACKS = [
  {
    id:        'starter',
    name:      'Starter',
    credits:   10,
    price:     9,
    priceId:   process.env.STRIPE_PRICE_STARTER ?? '',
    perCredit: 0.90,
    popular:   false,
  },
  {
    id:        'pro',
    name:      'Pro',
    credits:   50,
    price:     29,
    priceId:   process.env.STRIPE_PRICE_PRO ?? '',
    perCredit: 0.58,
    popular:   true,
  },
  {
    id:        'studio',
    name:      'Studio',
    credits:   200,
    price:     79,
    priceId:   process.env.STRIPE_PRICE_STUDIO ?? '',
    perCredit: 0.40,
    popular:   false,
  },
] as const
