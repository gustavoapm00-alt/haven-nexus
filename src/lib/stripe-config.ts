// Stripe product and price configuration
export const STRIPE_TIERS = {
  starter: {
    name: 'Starter',
    price: '$19',
    priceId: 'price_1Sd4tsPtWRTkeYvMl8V6tB1w',
    productId: 'prod_TaFOLiPNkW3N1A',
  },
  pro: {
    name: 'Pro',
    price: '$49',
    priceId: 'price_1Sd4u0PtWRTkeYvMgSlP5kTm',
    productId: 'prod_TaFOpvfmSYBAyI',
  },
  elite: {
    name: 'AERELION Elite',
    price: '$99',
    priceId: 'price_1Sd4u2PtWRTkeYvMNd6MKUe0',
    productId: 'prod_TaFOa9MluLIaFI',
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
