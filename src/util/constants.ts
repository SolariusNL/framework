import { PremiumSubscriptionType } from "@prisma/client";

const PREMIUM_PAYOUTS = {
  [PremiumSubscriptionType.PREMIUM_ONE_MONTH]: 1200,
  [PremiumSubscriptionType.PREMIUM_SIX_MONTHS]: 7200,
  [PremiumSubscriptionType.PREMIUM_ONE_YEAR]: 14400,
};

export { PREMIUM_PAYOUTS };
