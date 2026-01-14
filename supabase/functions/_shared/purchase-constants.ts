/**
 * Shared constants for purchase status handling in edge functions.
 */

// Valid success statuses for purchases (backwards compatible)
export const SUCCESS_STATUSES = ['completed', 'paid'] as const;

// The canonical status to write for new purchases
export const PURCHASE_SUCCESS_STATUS = 'completed';

// Type for valid success statuses
export type SuccessStatus = typeof SUCCESS_STATUSES[number];
