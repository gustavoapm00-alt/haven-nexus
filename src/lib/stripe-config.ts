// Stripe Dual-Scope Revenue Engine — System Access Levels
export const STRIPE_TIERS = {
  pulse: {
    name: 'The Pulse',
    codename: 'TIER-01',
    priceDisplay: '$99 – $250',
    price: '$99',
    priceId: 'price_1SzdaCJAQcpzy6vVzFLVYkgd',
    productId: 'prod_TxYhnRbOluZBaB',
    mode: 'subscription' as const,
  },
  operator: {
    name: 'The Operator',
    codename: 'TIER-02',
    priceDisplay: '$2,500 – $5,000',
    price: '$2,500',
    priceId: 'price_1SzdaEJAQcpzy6vVucQakAuA',
    productId: 'prod_TxYhoVock3Bxgb',
    mode: 'subscription' as const,
  },
  ghost: {
    name: 'The Ghost',
    codename: 'TIER-03',
    priceDisplay: '$25K – $50K',
    price: '$25,000',
    priceId: 'price_1SzdaGJAQcpzy6vVyMmTifQW',
    productId: 'prod_TxYhXs1DPZsWtZ',
    mode: 'payment' as const,
  },
} as const;

export type TierKey = keyof typeof STRIPE_TIERS;

export const getTierByProductId = (productId: string): TierKey | null => {
  for (const [key, tier] of Object.entries(STRIPE_TIERS)) {
    if (tier.productId === productId) {
      return key as TierKey;
    }
  }
  return null;
};

export const getTierByPriceId = (priceId: string): TierKey | null => {
  for (const [key, tier] of Object.entries(STRIPE_TIERS)) {
    if (tier.priceId === priceId) {
      return key as TierKey;
    }
  }
  return null;
};
