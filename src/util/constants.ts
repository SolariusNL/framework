import { PremiumSubscriptionType } from "@prisma/client";

const PREMIUM_PAYOUTS = {
  [PremiumSubscriptionType.PREMIUM_ONE_MONTH]: 1200,
  [PremiumSubscriptionType.PREMIUM_SIX_MONTHS]: 7200,
  [PremiumSubscriptionType.PREMIUM_ONE_YEAR]: 14400,
};
const COSMIC_SOCKETS = new Map<string, () => void>();

export { PREMIUM_PAYOUTS, COSMIC_SOCKETS };
