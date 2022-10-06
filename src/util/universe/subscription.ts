import { PremiumSubscriptionType } from "@prisma/client";

function getSubscriptionTypeString(
  subscriptionType: PremiumSubscriptionType
): string {
  switch (subscriptionType) {
    case PremiumSubscriptionType.PREMIUM_ONE_MONTH:
      return "Monthly";
    case PremiumSubscriptionType.PREMIUM_SIX_MONTHS:
      return "Six Months";
    case PremiumSubscriptionType.PREMIUM_ONE_YEAR:
      return "Yearly";
  }
}

export { getSubscriptionTypeString };
