import { GiftCodeGrant } from "@prisma/client";

const giftGrants = new Map<
  GiftCodeGrant,
  { description: string; type: "tickets" | "premium" }
>([
  [
    GiftCodeGrant.FIVETHOUSAND_TICKETS,
    { description: "5,000T$ grant", type: "tickets" },
  ],
  [
    GiftCodeGrant.PREMIUM_ONE_MONTH,
    { description: "1 month of Premium", type: "premium" },
  ],
  [
    GiftCodeGrant.PREMIUM_SIX_MONTHS,
    { description: "6 months of Premium", type: "premium" },
  ],
  [
    GiftCodeGrant.PREMIUM_ONE_YEAR,
    { description: "12 months of Premium", type: "premium" },
  ],
  [
    GiftCodeGrant.SIXTEENTHOUSAND_TICKETS,
    { description: "16,000T$ grant", type: "tickets" },
  ],
  [
    GiftCodeGrant.THOUSAND_TICKETS,
    { description: "1,000T$ grant", type: "tickets" },
  ],
  [
    GiftCodeGrant.TWOTHOUSAND_TICKETS,
    { description: "2,000T$ grant", type: "tickets" },
  ],
]);

export default giftGrants;
